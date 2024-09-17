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

    const lesson = await manager.getRepository(Lesson).findOneBy({ id: entity.lessonId });

    const lessonProcess = await manager.getRepository(LessonProcess).findOneBy({
      learnerProfileId: entity.learnerProfileId,
      questionTypeId: lesson.questionTypeId,
    });

    const carrots = calcCarrots(entity.duration);
    const xp = calcXP(entity.correctAnswers, entity.wrongAnswers);

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
            xp: xp,
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
        // Update lesson in lesson process
        // The most XP (accuracy) will be prioritized
        if (xp > lessonProcess.xp[lessonIndex].xp) {
          lessonProcess.xp[lessonIndex].xp = xp;
          lessonProcess.xp[lessonIndex].duration = entity.duration;
        }
      } else {
        // Add new lesson to lesson process
        lessonProcess.xp.push({
          lessonId: entity.lessonId,
          xp: xp,
          duration: entity.duration,
        });
      }

      await lessonProcess.save();
    }

    const learnerProfile = await manager.getRepository(LearnerProfile).findOneBy({ id: entity.learnerProfileId });
    learnerProfile.xp += xp;
    learnerProfile.carrots += carrots;
    await learnerProfile.save();
  }
}
