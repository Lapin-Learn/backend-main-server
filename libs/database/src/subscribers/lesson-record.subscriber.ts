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

    const lessonProcess = await manager
      .getRepository(LessonProcess)
      .createQueryBuilder("lesson_processes")
      .leftJoinAndSelect("lesson_processes.currentLesson", "currentLesson")
      .where("lesson_processes.learner_profile_id = :learnerProfileId", { learnerProfileId: entity.learnerProfileId })
      .andWhere("lesson_processes.question_type_id = :questionTypeId", { questionTypeId: lesson.questionTypeId })
      .andWhere("lesson_processes.band_score = :bandScore", { bandScore: lesson.bandScore })
      .getOne();

    const { bonusXP: xp } = entity.getBonusResources();

    const nextLesson = await manager.getRepository(Lesson).findOneBy({
      questionTypeId: lessonProcess ? lessonProcess.questionTypeId : lesson.questionTypeId,
      bandScore: lessonProcess ? lessonProcess.bandScore : lesson.bandScore,
      order: lessonProcess ? lessonProcess.currentLesson.order + 1 : lesson.order + 1,
    });

    // Update lesson process
    if (!lessonProcess) {
      await manager.getRepository(LessonProcess).save({
        learnerProfileId: entity.learnerProfileId,
        questionTypeId: lesson.questionTypeId,
        currentLesson: nextLesson || lesson,
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

        // Update current lesson to next lesson, this is the case when add new lesson to the list
        if (nextLesson && lessonProcess.currentLesson.id === entity.lessonId) {
          lessonProcess.currentLesson = nextLesson;
        }
      } else {
        // Add new lesson to lesson process
        lessonProcess.xp.push({
          lessonId: entity.lessonId,
          xp,
          duration: entity.duration,
        });

        nextLesson && (lessonProcess.currentLesson = nextLesson);
      }

      await lessonProcess.save();
    }
  }
}
