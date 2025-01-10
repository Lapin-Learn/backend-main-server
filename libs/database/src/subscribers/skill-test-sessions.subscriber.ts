import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from "typeorm";
import { SkillTestRecord, SkillTestSession } from "../entities";
import { SkillEnum, TestSessionStatusEnum } from "@app/types/enums";

@EventSubscriber()
export class SkillTestSessionSubscriber implements EntitySubscriberInterface<SkillTestSession> {
  listenTo(): typeof SkillTestSession {
    return SkillTestSession;
  }

  async afterUpdate(event: UpdateEvent<SkillTestSession>): Promise<void> {
    try {
      const { entity, manager } = event;
      if (entity?.status === TestSessionStatusEnum.FINISHED) {
        const { parts, results, skillTest, learnerProfileId } = await SkillTestSession.findOne({
          where: { id: entity.id },
          relations: { skillTest: true },
        });
        const records: {
          evaluationType: string;
          sessionId: number;
          accuracy: number;
          learnerId: string;
          skill: SkillEnum;
        }[] = [];

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
        }
        await manager.getRepository(SkillTestRecord).save(records);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
