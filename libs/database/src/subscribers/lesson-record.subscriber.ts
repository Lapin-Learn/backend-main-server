import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { Lesson, LessonProcess, LessonRecord } from "../entities";

@EventSubscriber()
export class LessonRecordSubscriber implements EntitySubscriberInterface<LessonRecord> {
  listenTo(): typeof LessonRecord {
    return LessonRecord;
  }

  async afterInsert(event: InsertEvent<LessonRecord>): Promise<void> {
    const { entity, manager } = event;

    const lesson = await manager.getRepository(Lesson).findOneBy({ id: entity.lessonId });

    const lessonProcess = await manager.getRepository(LessonProcess).findOneBy({
      learnerProfileId: entity.learnerProfileId,
      questionTypeId: lesson.questionTypeId,
    });

    const { bonusXP: xp } = entity.getBonusResources();

    // Update lesson process
    if (!lessonProcess) {
      await manager.getRepository(LessonProcess).save({
        learnerProfileId: entity.learnerProfileId,
        questionTypeId: lesson.questionTypeId,
        currentLessonId: entity.lessonId,
        bandScore: lesson.bandScore,
        xp: [
          {
            lessonId: entity.lessonId,
            xp,
            duration: entity.duration,
          },
        ],
      });
    } else {
      lessonProcess.currentLessonId =
        entity.lessonId > lessonProcess.currentLessonId ? entity.lessonId : lessonProcess.currentLessonId;

      // Check if lesson is already completed
      const lessonIndex = lessonProcess.xp.findIndex((xp) => xp.lessonId === entity.lessonId);

      if (lessonIndex !== -1) {
        // Always update the duration
        lessonProcess.xp[lessonIndex].duration += entity.duration;

        // Update lesson in lesson process
        lessonProcess.xp[lessonIndex].duration += entity.duration;
        // The most XP (accuracy) will be prioritized
        if (xp > lessonProcess.xp[lessonIndex].xp) {
          lessonProcess.xp[lessonIndex].xp = xp;
        }
      } else {
        // Add new lesson to lesson process
        lessonProcess.xp.push({
          lessonId: entity.lessonId,
          xp,
          duration: entity.duration,
        });
      }

      await lessonProcess.save();
    }
  }
}
