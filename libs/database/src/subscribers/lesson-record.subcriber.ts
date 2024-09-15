import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { LearnerProfile, Lesson, LessonProcess, LessonRecord } from "../entities";
import { calcCarrots, calcXP } from "@app/utils/helper";

@EventSubscriber()
export class LessonRecordSubscriber implements EntitySubscriberInterface<LessonRecord> {
  listenTo(): typeof LessonRecord {
    return LessonRecord;
  }

  async afterInsert(event: InsertEvent<LessonRecord>): Promise<void> {
    const { entity, manager } = event;
    const lessonProcess = await manager.getRepository(LessonProcess).findOneBy({
      learnerProfileId: entity.learnerProfileId,
      currentLessonId: entity.lessonId,
    });

    const lesson = await manager.getRepository(Lesson).findOneBy({ id: entity.lessonId });

    // Update lesson process
    if (!lessonProcess) {
      await manager.getRepository(LessonProcess).save({
        learnerProfileId: entity.learnerProfileId,
        currentLessonId: entity.lessonId,
        questionTypeId: lesson.questionTypeId,
        bandScore: lesson.bandScore,
        xp: [
          {
            lessonId: entity.lessonId,
            xp: calcXP(entity.correctAnswers, entity.wrongAnswers),
            duration: entity.duration,
          },
        ],
      });
    } else {
      lessonProcess.xp.push({
        lessonId: entity.lessonId,
        xp: calcXP(entity.correctAnswers, entity.wrongAnswers),
        duration: entity.duration,
      });
      await lessonProcess.save();
    }

    // Update learner profile
    const learnerProfile = await manager.getRepository(LearnerProfile).findOneBy({ id: entity.learnerProfileId });
    learnerProfile.xp += calcXP(entity.correctAnswers, entity.wrongAnswers);
    learnerProfile.carrots += calcCarrots(entity.duration);
    await learnerProfile.save();
  }
}
