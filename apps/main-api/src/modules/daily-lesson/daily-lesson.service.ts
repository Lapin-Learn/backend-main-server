import { Lesson, QuestionType } from "@app/database";
import { SkillEnum } from "@app/types/enums";
import { Injectable } from "@nestjs/common";
import { isNil } from "lodash";

@Injectable()
export class DailyLessonService {
  async getQuestionTypes(skill: SkillEnum) {
    return isNil(skill) ? QuestionType.ofAllSkills() : QuestionType.ofASkill(skill);
  }

  async getLessonsOfQuestionType(questionTypeId: number) {
    return Lesson.getContentOfLesson(questionTypeId);
  }
}
