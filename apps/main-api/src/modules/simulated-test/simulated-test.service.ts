import { Injectable, Logger, BadRequestException, ForbiddenException, Inject } from "@nestjs/common";
import {
  Bucket,
  LearnerProfile,
  SimulatedIeltsTest,
  SkillTest,
  SkillTestAnswer,
  SkillTestRecord,
  SkillTestSession,
  TestCollection,
} from "@app/database";
import {
  GetSessionProgressDto,
  InfoSpeakingResponseDto,
  InfoTextResponseDto,
  SpeakingResponseDto,
  StartSessionDto,
  TextResponseDto,
  UpdateSessionDto,
} from "@app/types/dtos/simulated-tests";
import _ from "lodash";
import { BucketService } from "../bucket/bucket.service";
import { GradingContext } from "@app/shared-modules/grading";
import { SkillEnum, TestSessionModeEnum, TestSessionStatusEnum } from "@app/types/enums";
import { EvaluateSpeaking, EvaluateWriting, RangeGradingStrategy } from "@app/shared-modules/grading";
import {
  SPEAKING_FILE_PREFIX,
  OK_RESPONSE,
  REQUIRED_CREDENTIAL,
  EVALUATE_SPEAKING_QUEUE,
  EVALUATE_WRITING_QUEUE,
  MISSION_SUBJECT_FACTORY,
  PUSH_SPEAKING_FILE_QUEUE,
  FINISHED_STATUSES,
  LEARNER_SUBJECT_FACTORY,
  GET_AUDIO_TRANSCRIPT,
} from "@app/types/constants";
import { plainToInstance } from "class-transformer";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ITestCollection, ICurrentUser, IGradingStrategy, IBucket } from "@app/types/interfaces";
import { MileStonesObserver } from "@app/shared-modules/observers";
import { LearnerProfileSubject, MissionSubject } from "@app/shared-modules/subjects";

@Injectable()
export class SimulatedTestService {
  private readonly logger = new Logger(SimulatedTestService.name);
  constructor(
    private readonly bucketService: BucketService,
    private readonly gradingContext: GradingContext,
    private readonly observer: MileStonesObserver,
    @InjectQueue(EVALUATE_SPEAKING_QUEUE) private speakingQueue: Queue,
    @InjectQueue(EVALUATE_WRITING_QUEUE) private writingQueue: Queue,
    @InjectQueue(PUSH_SPEAKING_FILE_QUEUE) private pushFileQueue: Queue,
    @InjectQueue(GET_AUDIO_TRANSCRIPT) private getTranscriptQueue: Queue,
    @Inject(MISSION_SUBJECT_FACTORY)
    private readonly missionSubjectFactory: (observer: MileStonesObserver) => MissionSubject,
    @Inject(LEARNER_SUBJECT_FACTORY)
    private readonly learnerSubjectFactory: (observer: MileStonesObserver) => LearnerProfileSubject
  ) {}
  async getCollectionsWithSimulatedTest(offset: number, limit: number, profileId: string) {
    try {
      const data = await TestCollection.getCollectionsWithTests(offset, limit, profileId);
      const total = await TestCollection.count();
      return {
        items: await Promise.all(
          data.map(async (collection: ITestCollection) => ({
            ...collection,
            thumbnail: await this.bucketService.getPresignedDownloadUrlForAfterLoad(collection.thumbnail),
          }))
        ),
        total,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getCollectionsForIntroduction() {
    try {
      const collections = await TestCollection.getListCollectionsForIntroduction();
      return await Promise.all(
        collections.map(async (collection) => ({
          ...collection,
          thumbnail: await this.bucketService.getPresignedDownloadUrlForAfterLoad({
            id: collection.thumbnail,
          } as unknown as IBucket),
        }))
      );
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  async getAutoCompleteCollections(keyword: string) {
    try {
      return TestCollection.getCollectionByKeyword(keyword);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  async getCollectionInformation(collectionId: number) {
    try {
      const data = await TestCollection.findOneOrFail({
        where: { id: collectionId },
        relations: {
          thumbnail: true,
        },
      });
      this.logger.log(data);
      return {
        ...data,
        thumbnail: await this.bucketService.getPresignedDownloadUrlForAfterLoad(data.thumbnail),
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getSimulatedTestsInCollections(collectionId: number, offset: number, limit: number, profileId: string) {
    try {
      const items = await SimulatedIeltsTest.getSimulatedTestInCollections(collectionId, offset, limit, profileId);
      const groupedItems = _.groupBy(items, "id");

      const formattedItems = _.map(groupedItems, (group) => {
        const collectionId = group[0].id ?? null;
        const order = group[0].order ?? null;
        const testName = group[0].testName ?? "";
        let totalTimeSpent = 0;

        const validGroup = group.filter(
          (item: any) => item.skill !== null || item.status === TestSessionStatusEnum.CANCELED
        );
        const skillTests = _.groupBy(validGroup, "skill");

        const essentialData = _.map(skillTests, (st: any) => {
          const {
            status,
            skill,
            estimatedBandScore,
            results,
            responses,
            elapsedTime,
            skillTestId,
            sessionId,
            partsDetail = [],
          } = st[0];
          totalTimeSpent += elapsedTime;

          let correctAnswers = 0;

          if (
            (skill === SkillEnum.READING || skill === SkillEnum.LISTENING) &&
            status === TestSessionStatusEnum.FINISHED &&
            results
          ) {
            correctAnswers = results.filter((t: boolean) => Boolean(t)).length;
          }

          const submittedAnswers = responses
            ? responses.filter((r: InfoTextResponseDto | InfoSpeakingResponseDto) => r !== null).length
            : 0;

          return {
            skillTestId,
            sessionId,
            status: status ?? TestSessionStatusEnum.NOT_STARTED,
            estimatedBandScore,
            submittedAnswers,
            correctAnswers,
            skill,
            partsDetail,
          };
        });

        return {
          id: collectionId,
          order,
          testName,
          totalTimeSpent,
          skillTests: essentialData,
        };
      });

      const total = await SimulatedIeltsTest.countBy({ collectionId });
      return { items: formattedItems, total };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getSimulatedTestInfo(testId: number) {
    try {
      return await SimulatedIeltsTest.findOne({
        where: { id: testId },
        relations: {
          skillTests: true,
        },
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async startSession(learner: ICurrentUser, sessionData: StartSessionDto) {
    try {
      const currentSession = await SkillTestSession.findExistedSession(learner.profileId, sessionData);
      if (currentSession) return currentSession;

      return SkillTestSession.create({
        ...sessionData,
        learnerProfileId: learner.profileId,
      }).save();
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getSessionHistory(
    learner: ICurrentUser,
    offset: number,
    limit: number,
    filter?: { simulatedTestId: number; skill: SkillEnum }
  ) {
    try {
      const { simulatedTestId, skill } = filter || {};
      const { items, total } = await SkillTestSession.getSessionHistory(
        learner.profileId,
        offset,
        limit,
        simulatedTestId,
        skill
      );

      items.map((h: SkillTestSession) => {
        h["totalQuestions"] = h.results.length;
        h["testName"] = h.skillTest.simulatedIeltsTest.testName;
        h["skill"] = h.skillTest.skill;
        if (
          !h.estimatedBandScore &&
          (h.skillTest.skill === SkillEnum.READING || h.skillTest.skill === SkillEnum.LISTENING)
        ) {
          h["correctAnswers"] = h.results.filter((r) => r === true).length;
        }
        delete h.results;
        delete h.skillTest;
        return h;
      });

      return { items, total };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getSessionDetail(sessionId: number, learner: ICurrentUser) {
    try {
      const session = await SkillTestSession.getSessionDetail(sessionId, learner.profileId);
      if (session) {
        const parts = session.parts;
        const partsDetail = session.skillTest?.partsDetail || [];

        session.skillTest.partsDetail = parts
          ? parts
              .filter((partIndex) => partIndex > 0 && partIndex <= partsDetail.length)
              .map((partIndex) => partsDetail[partIndex - 1])
          : [];

        if (FINISHED_STATUSES.includes(session.status)) {
          session.skillTest["answers"] = session.skillTest.skillTestAnswer?.answers ?? [];
          session.skillTest["guidances"] = session.skillTest.skillTestAnswer?.guidances ?? [];

          if (session.skillTest.skill === SkillEnum.SPEAKING) {
            const fileName = `${SPEAKING_FILE_PREFIX}-${sessionId}`;
            const bucket = await Bucket.findOne({ where: { name: fileName, owner: learner.userId } });
            if (bucket) {
              session["resource"] = bucket.url;
            }
          }
          delete session.skillTest.skillTestAnswer;
        }
      }
      return session;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async updateSession(
    sessionId: number,
    sessionData: UpdateSessionDto,
    learner: ICurrentUser,
    additionalResources: Array<Express.Multer.File> = null
  ) {
    try {
      const { status, response } = sessionData;
      const {
        skillTestId,
        mode,
        parts,
        skillTest,
        status: sessionStatus,
      } = await SkillTestSession.findOneOrFail({
        where: { id: sessionId, learnerProfileId: learner.profileId },
        relations: { skillTest: true },
      });

      if (sessionStatus === TestSessionStatusEnum.CANCELED) {
        throw new BadRequestException(`session was already canceled`);
      }

      if (FINISHED_STATUSES.includes(sessionStatus)) {
        throw new BadRequestException(`session was already ${sessionStatus}`);
      }

      let responseInfo = null;
      if (status === TestSessionStatusEnum.FINISHED) {
        const { response } = sessionData;
        responseInfo = response.info.sort(
          (a: InfoSpeakingResponseDto | InfoTextResponseDto, b: InfoSpeakingResponseDto | InfoTextResponseDto) => {
            if (a instanceof InfoSpeakingResponseDto && b instanceof InfoSpeakingResponseDto) {
              if (a.partNo === b.partNo) return a.questionNo - b.questionNo;
              else return a.partNo - b.partNo;
            }
            return a.questionNo - b.questionNo;
          }
        );

        if (response instanceof SpeakingResponseDto) {
          const speakingStrategy = new EvaluateSpeaking(sessionId, responseInfo);
          const { userResponses, speakingAudio } =
            await speakingStrategy.getResponseWithTimeStampAudio(additionalResources);
          responseInfo = userResponses;

          speakingStrategy.setPushSpeakingFileQueue(this.pushFileQueue);
          await speakingStrategy.pushSpeakingFile(speakingAudio, learner);
          sessionData.status = TestSessionStatusEnum.NOT_EVALUATED;
          this.gradingContext.setGradingStrategy(speakingStrategy);
        } else if (response instanceof TextResponseDto) {
          if (skillTest.skill === SkillEnum.WRITING) {
            this.gradingContext.setGradingStrategy(new EvaluateWriting(sessionId, responseInfo));
            sessionData.status = TestSessionStatusEnum.NOT_EVALUATED;
          } else {
            const { answers } = await SkillTestAnswer.findOneOrFail({
              where: { skillTestId },
              relations: { skillTest: true },
            });

            const rangeStrategy = new RangeGradingStrategy(answers, responseInfo, skillTest.skill);
            rangeStrategy.evaluateBandScore();
            sessionData["results"] = rangeStrategy.getResults();
            this.gradingContext.setGradingStrategy(rangeStrategy);
          }
        }

        if (mode === TestSessionModeEnum.FULL_TEST || parts.length === skillTest?.partsDetail?.length) {
          sessionData["estimatedBandScore"] = this.gradingContext.getEstimatedScore();
        }
      } else if (status === TestSessionStatusEnum.IN_PROGRESS) {
        if (response instanceof TextResponseDto && mode === TestSessionModeEnum.PRACTICE) {
          responseInfo = response.info;
        }
      }

      await SkillTestSession.save({ id: sessionId, ...sessionData, responses: responseInfo });

      if (FINISHED_STATUSES.includes(sessionData.status)) {
        if (skillTest.skill === SkillEnum.SPEAKING)
          await this.getTranscriptQueue.add(GET_AUDIO_TRANSCRIPT, {
            sessionId,
            audioFiles: additionalResources,
          });

        const learnerProfile = await LearnerProfile.findOne({ where: { id: learner.profileId } });
        const missionSubject = this.missionSubjectFactory(this.observer);
        await missionSubject.checkMissionProgress(learnerProfile);

        const learnerSubject = this.learnerSubjectFactory(this.observer);
        await learnerSubject.checkProfileChange(learnerProfile);
        const milestones = this.observer.getMileStones();
        return milestones;
      }

      return OK_RESPONSE;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async evaluateSkillTest(sessionId: number, learner: ICurrentUser) {
    try {
      const session = await SkillTestSession.findOneOrFail({
        where: { id: sessionId, learnerProfileId: learner.profileId },
        relations: {
          skillTest: true,
          learnerProfile: true,
        },
      });

      if (
        session.status !== TestSessionStatusEnum.NOT_EVALUATED &&
        session.status !== TestSessionStatusEnum.EVALUATION_FAILED
      ) {
        throw new BadRequestException(`Session is already ${session.status}`);
      }

      if (session.learnerProfile.carrots < REQUIRED_CREDENTIAL) {
        throw new ForbiddenException("You don't have enough carrots");
      }
      let strategy: IGradingStrategy;
      if (session.skillTest.skill === SkillEnum.SPEAKING) {
        const speakingResponses = plainToInstance(InfoSpeakingResponseDto, session.responses as Array<any>);
        const speakingStrategy = new EvaluateSpeaking(sessionId, speakingResponses);
        speakingStrategy.setEvaluateSpeakingQueue(this.speakingQueue);
        strategy = speakingStrategy;
      } else if (session.skillTest.skill === SkillEnum.WRITING) {
        const writingResponses = plainToInstance(InfoTextResponseDto, session.responses as Array<any>);
        const writingStategy = new EvaluateWriting(sessionId, writingResponses);
        writingStategy.setQueue(this.writingQueue);
        strategy = writingStategy;
      } else {
        throw new BadRequestException("This skill test is not supported with AI evaluation");
      }
      this.gradingContext.setGradingStrategy(strategy);
      this.gradingContext.evaluateBandScore();
      await SkillTestSession.save({
        ...session,
        status: TestSessionStatusEnum.IN_EVALUATING,
      });

      await LearnerProfile.save({
        ...session.learnerProfile,
        carrots: session.learnerProfile.carrots - REQUIRED_CREDENTIAL,
      });
      return OK_RESPONSE;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getSkillTestContent(skillTestId: number, part: number) {
    try {
      const skillTest = await SkillTest.findOne({
        where: { id: skillTestId },
        select: {
          partsContent: true,
        },
      });

      if (_.isNil(skillTest) || _.isNil(skillTest.partsContent))
        throw new BadRequestException("Test data doesn't existed");
      if (skillTest.partsContent.length < part) throw new BadRequestException(`Test doesn't have part ${part}`);
      return skillTest.partsContent[part - 1];
    } catch (error) {
      this.logger.log(error);
      throw new BadRequestException(error);
    }
  }

  async getBandScoreReport(learner: ICurrentUser) {
    try {
      const plainReport = await SkillTestSession.getBandScoreReport(learner.profileId);
      return plainToInstance(SkillTestSession, plainReport);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getSessionProgress(learner: ICurrentUser, data: GetSessionProgressDto) {
    try {
      return SkillTestSession.getSessionProgress(learner.profileId, data.skill, data.from, data.to);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getQuestionTypeAccuracy(learner: ICurrentUser, skill: SkillEnum) {
    try {
      const plainRecords = await SkillTestRecord.getAccuracy(learner.profileId, skill);
      return plainToInstance(SkillTestRecord, plainRecords);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
