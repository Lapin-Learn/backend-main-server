import { DeepPartial, EntitySubscriberInterface, EventSubscriber, UpdateEvent } from "typeorm";
import { SkillTestRecord, SkillTestSession } from "../entities";
import { GenAIPartEnum, SkillEnum, TestSessionStatusEnum } from "@app/types/enums";
import { plainToInstance } from "class-transformer";
import {
  SpeakingCriteriaDto,
  SpeakingEvaluation,
  WritingCriteriaDto,
  WritingEvaluation,
} from "@app/types/dtos/simulated-tests";
import { EvaluationCriteriaName } from "@app/utils/maps";

@EventSubscriber()
export class SkillTestSessionSubscriber implements EntitySubscriberInterface<SkillTestSession> {
  listenTo(): typeof SkillTestSession {
    return SkillTestSession;
  }

  async afterUpdate(event: UpdateEvent<SkillTestSession>): Promise<void> {
    try {
      const { entity, manager } = event;
      if (entity?.status === TestSessionStatusEnum.FINISHED) {
        const { parts, skillTest, learnerProfileId } = await SkillTestSession.findOne({
          where: { id: entity.id },
          relations: { skillTest: true },
        });
        const { results } = entity;
        const records: DeepPartial<SkillTestRecord>[] = [];

        if (skillTest.skill === SkillEnum.READING || skillTest.skill === SkillEnum.LISTENING) {
          const { partsDetail } = skillTest;
          let partIndexAnswer = 0;
          for (const part of parts) {
            const { questionTypesIndices } = partsDetail[part - 1];
            for (const type of questionTypesIndices) {
              const startIndex = partIndexAnswer;
              const endIndex = startIndex + (type.endIndex - type.startIndex);

              if (startIndex >= 0 && endIndex <= results.length) {
                const typeRes = results.slice(startIndex, endIndex);
                const accuracy = (typeRes.filter((r) => r === true).length / typeRes.length) * 100;
                records.push({
                  accuracy,
                  sessionId: entity.id,
                  evaluationType: type.name,
                  learnerId: learnerProfileId,
                  skill: skillTest.skill,
                });
                partIndexAnswer = endIndex;
              }
            }
          }
        } else if (skillTest.skill === SkillEnum.SPEAKING && results && results.length) {
          const evaluations = plainToInstance(SpeakingEvaluation, results as object[]);
          if (evaluations) {
            const overallEvaluation: SpeakingCriteriaDto = evaluations.find(
              (e) => e.part === GenAIPartEnum.OVERALL
            ).criterias;
            for (const [key, value] of Object.entries(overallEvaluation)) {
              const evaluationType = EvaluationCriteriaName.get(key);
              if (evaluationType) {
                records.push({
                  accuracy: value.score,
                  sessionId: entity.id,
                  evaluationType: EvaluationCriteriaName.get(key),
                  learnerId: learnerProfileId,
                  skill: skillTest.skill,
                });
              }
            }
          }
        } else if (skillTest.skill === SkillEnum.WRITING && results && results.length) {
          const evaluations = plainToInstance(WritingEvaluation, results as object[]);
          if (evaluations) {
            const overallEvaluation: WritingCriteriaDto = evaluations.find(
              (e) => e.part === GenAIPartEnum.OVERALL
            ).criterias;
            for (const [key, value] of Object.entries(overallEvaluation)) {
              const evaluationType = EvaluationCriteriaName.get(key);
              if (evaluationType) {
                records.push({
                  accuracy: value.score,
                  sessionId: entity.id,
                  evaluationType: EvaluationCriteriaName.get(key),
                  learnerId: learnerProfileId,
                  skill: skillTest.skill,
                });
              }
            }
          }
        }

        if (records.length > 0) await manager.getRepository(SkillTestRecord).save(records);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
