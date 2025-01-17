import {
  SimulatedIeltsTest,
  SkillTest,
  SkillTestAnswer,
  SkillTestRecord,
  SkillTestSession,
  TestCollection,
} from "@app/database";
import {
  GetSessionProgressDto,
  SpeakingResponseDto,
  StartSessionDto,
  TextResponseDto,
  UpdateSessionDto,
} from "@app/types/dtos/simulated-tests";
import { ICurrentUser, ITestCollection } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import _ from "lodash";
import { BucketService } from "../bucket/bucket.service";
import { GradingContext } from "@app/shared-modules/grading";
import { SkillEnum, TestSessionModeEnum, TestSessionStatusEnum } from "@app/types/enums";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { EvaluateSpeaking, EvaluateWriting, RangeGradingStrategy } from "@app/shared-modules/grading/grading-strategy";
import { EVALUATE_SPEAKING_QUEUE, EVALUATE_WRITING_QUEUE, OK_RESPONSE } from "@app/types/constants";
import { plainToInstance } from "class-transformer";

@Injectable()
export class SimulatedTestService {
  private readonly logger = new Logger(SimulatedTestService.name);
  constructor(
    private readonly bucketService: BucketService,
    private readonly gradingContext: GradingContext,
    @InjectQueue(EVALUATE_SPEAKING_QUEUE) private evaluateSpeakingQueue: Queue,
    @InjectQueue(EVALUATE_WRITING_QUEUE) private evaluateWritingQueue: Queue
  ) {}
  async getCollectionsWithSimulatedTest(offset: number, limit: number, keyword: string, profileId: string) {
    try {
      const data = await TestCollection.getCollectionsWithTests(offset, limit, keyword, profileId);
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

  async getSimulatedTestsInCollections(collectionId: number, offset: number, limit: number, profileId: string) {
    try {
      const items = await SimulatedIeltsTest.getSimulatedTestInCollections(collectionId, offset, limit, profileId);
      const groupedItems = _.groupBy(items, "id");

      const formattedItems = _.map(groupedItems, (group) => {
        const collectionId = group[0].id || null;
        const order = group[0].order || null;
        const testName = group[0].testname || "";
        let totalTimeSpent = 0;

        const skillTests = _.map(group, (item) => {
          totalTimeSpent += item.elapsedtime;
          return {
            id: item.skilltestid,
            skill: item.skill,
            partsDetail: item.partsdetail || [],
            status: item.status || null,
            estimatedBandScore: item.estimatedbandscore || null,
            sessionId: item.sessionid,
          };
        });

        return {
          id: collectionId,
          order,
          testName,
          totalTimeSpent,
          skillTests,
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

  async getSessionDetail(sessionId: number, profileId: string) {
    try {
      const session = await SkillTestSession.getSessionDetail(sessionId, profileId);
      if (session) {
        const parts = session.parts;
        const partsDetail = session.skillTest?.partsDetail || [];

        session.skillTest.partsDetail = parts
          ? parts
              .filter((partIndex) => partIndex > 0 && partIndex <= partsDetail.length)
              .map((partIndex) => partsDetail[partIndex - 1])
          : [];

        session.status === TestSessionStatusEnum.FINISHED &&
          (session.skillTest["answers"] = session.skillTest.skillTestAnswer?.answers ?? []);
        session.status === TestSessionStatusEnum.FINISHED &&
          (session.skillTest["guidances"] = session.skillTest.skillTestAnswer?.guidances ?? []);
        delete session.skillTest.skillTestAnswer;
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

      if (
        sessionStatus === TestSessionStatusEnum.FINISHED ||
        sessionStatus === TestSessionStatusEnum.CANCELED ||
        sessionStatus === TestSessionStatusEnum.IN_EVALUATING
      ) {
        throw new BadRequestException(`Session is ${sessionStatus}`);
      }

      let responseInfo = null;
      if (status === TestSessionStatusEnum.FINISHED) {
        const { response } = sessionData;

        if (response instanceof SpeakingResponseDto) {
          this.gradingContext.setGradingStrategy(
            new EvaluateSpeaking(
              this.evaluateSpeakingQueue,
              sessionId,
              EVALUATE_SPEAKING_QUEUE,
              additionalResources,
              response.info
            )
          );
          sessionData.status = TestSessionStatusEnum.IN_EVALUATING;
          responseInfo = response.info;
        } else if (response instanceof TextResponseDto) {
          const { info } = response;
          responseInfo = info.sort((a, b) => a.questionNo - b.questionNo);

          if (skillTest.skill === SkillEnum.WRITING) {
            this.gradingContext.setGradingStrategy(
              new EvaluateWriting(this.evaluateWritingQueue, sessionId, EVALUATE_WRITING_QUEUE, info)
            );
            sessionData.status = TestSessionStatusEnum.IN_EVALUATING;
          } else {
            const { answers } = await SkillTestAnswer.findOneOrFail({
              where: { skillTestId },
              relations: { skillTest: true },
            });

            this.gradingContext.setGradingStrategy(new RangeGradingStrategy(answers, info, skillTest.skill));
          }
        }

        this.gradingContext.evaluateBandScore();

        sessionData["results"] = this.gradingContext.getResults();
        if (mode === TestSessionModeEnum.FULL_TEST || parts.length === skillTest?.partsDetail?.length) {
          sessionData["estimatedBandScore"] = this.gradingContext.getEstimatedScore();
        }
      } else if (status === TestSessionStatusEnum.IN_PROGRESS) {
        if (response instanceof TextResponseDto && mode === TestSessionModeEnum.PRACTICE) {
          responseInfo = response.info;
        }
      }
      await SkillTestSession.save({ id: sessionId, ...sessionData, responses: responseInfo });
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
    const plainReport = await SkillTestSession.getBandScoreReport(learner.profileId);
    return plainToInstance(SkillTestSession, plainReport);
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
