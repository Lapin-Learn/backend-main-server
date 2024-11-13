import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent, Not } from "typeorm";
import { Lesson } from "../entities";
import { ILesson } from "@app/types/interfaces";

@EventSubscriber()
export class LessonSubscriber implements EntitySubscriberInterface<ILesson> {
  listenTo(): typeof Lesson {
    return Lesson;
  }

  async beforeInsert(event: InsertEvent<ILesson>): Promise<void> {
    const lesson = event.entity;
    const currentTotalLessonsCategory = await Lesson.count({
      where: { questionTypeId: lesson.questionTypeId, bandScore: lesson.bandScore },
    });

    lesson.order = currentTotalLessonsCategory + 1;
  }

  async beforeUpdate(event: UpdateEvent<ILesson>): Promise<void> {
    const previousLessonCategory = event.databaseEntity;
    const updatedLessonCategory = event.entity;

    // If questionTypeId or bandScore has changed
    if (
      updatedLessonCategory.questionTypeId !== previousLessonCategory.questionTypeId ||
      updatedLessonCategory.bandScore !== previousLessonCategory.bandScore
    ) {
      // Get all the lessons with the old questionTypeId and bandScore, ordered by 'order'
      const listPreviousLessonsCategory = await Lesson.find({
        where: {
          id: Not(updatedLessonCategory.id),
          questionTypeId: previousLessonCategory.questionTypeId,
          bandScore: previousLessonCategory.bandScore,
        },
        order: { order: "ASC" },
      });

      // Update the 'order' of each lesson
      for (let i = 0; i < listPreviousLessonsCategory.length; i++) {
        listPreviousLessonsCategory[i].order = i + 1;
        await listPreviousLessonsCategory[i].save();
      }

      const currentTotalLessonsCategory = await Lesson.count({
        where: { questionTypeId: updatedLessonCategory.questionTypeId, bandScore: updatedLessonCategory.bandScore },
      });

      // Use this to update directly the 'order' of the updated lesson without triggering the 'afterupdate' hook
      event.entity.order = currentTotalLessonsCategory + 1;
    }
  }
}
