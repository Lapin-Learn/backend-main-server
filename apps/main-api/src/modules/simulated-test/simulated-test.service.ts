import { SimulatedIeltsTest, SkillTest, SkillTestAnswer, SkillTestSession, TestCollection } from "@app/database";
import { StartSessionDto, UpdateSessionDto } from "@app/types/dtos/simulated-tests";
import { ICurrentUser, ITestCollection } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import _ from "lodash";
import { BucketService } from "../bucket/bucket.service";
import { GradingContext } from "@app/shared-modules/grading";
import { SkillEnum, TestSessionModeEnum, TestSessionStatusEnum } from "@app/types/enums";

@Injectable()
export class SimulatedTestService {
  private readonly logger = new Logger(SimulatedTestService.name);
  constructor(
    private readonly bucketService: BucketService,
    private readonly gradingContext: GradingContext
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

  async getSessionHistory(learner: ICurrentUser, offset: number, limit: number) {
    try {
      const histories = await SkillTestSession.getSessionHistory(learner.profileId, offset, limit);
      histories.map((h: SkillTestSession) => {
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

      const total = await SkillTestSession.countBy({
        learnerProfileId: learner.profileId,
        status: TestSessionStatusEnum.FINISHED,
      });
      return { items: histories, total };
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
          .filter((partIndex) => partIndex > 0 && partIndex <= partsDetail.length)
          .map((partIndex) => partsDetail[partIndex - 1]);

        session.skillTest["answers"] = session.skillTest.skillTestAnswer.answers ?? [];
        session.status === TestSessionStatusEnum.FINISHED &&
          (session.skillTest["guidances"] = session.skillTest.skillTestAnswer.guidances);
        delete session.skillTest.skillTestAnswer;
      }
      return session;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async updateSession(sessionId: number, sessionData: UpdateSessionDto) {
    try {
      const { status, responses } = sessionData;
      if (status === TestSessionStatusEnum.FINISHED) {
        const { skillTestId, mode, parts } = await SkillTestSession.findOne({ where: { id: sessionId } });
        const { answers, skillTest } = await SkillTestAnswer.findOne({
          where: { skillTestId },
          relations: { skillTest: true },
        });
        const results = [];

        if (answers && answers.length > 0) {
          responses.map((r) => {
            const answer = answers[r.questionNo - 1];
            if (answer) {
              this.gradingContext.setValidator(answer);
              results.push(this.gradingContext.validate(r.answer, answer));
            } else {
              results.push(null);
            }
          });
          sessionData["results"] = results;
        }
        if (mode == TestSessionModeEnum.FULL_TEST || parts.length === skillTest.partsDetail.length) {
          this.gradingContext.setGradingStrategy(skillTest.skill);
          sessionData["estimatedBandScore"] = this.gradingContext.grade(results);
        }
      }
      await SkillTestSession.save({ id: sessionId, ...sessionData });
      return "Ok";
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
    return SkillTestSession.getBandScoreReport(learner.profileId);
  }
}
