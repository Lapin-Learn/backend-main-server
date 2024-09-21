import { Lesson, Question, QuestionType } from "@app/database";
import {
  CreateLessonDto,
  CreateQuestionDto,
  CreateQuestionTypeDto,
  QueryParamQuestionDto,
  UpdateLessonDto,
  UpdateQuestionDto,
  UpdateQuestionTypeDto,
} from "@app/types/dtos/admin";
import { ILesson, IListQuestion, IQuestion, IQuestionType } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import _ from "lodash";

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  createQuestion(createQuestionDto: CreateQuestionDto): Promise<IQuestion> {
    try {
      return Question.save({
        ...createQuestionDto,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getQuestions(queryParamQuestionDto: QueryParamQuestionDto): Promise<IListQuestion> {
    try {
      return Question.getQuestionsWithParams(queryParamQuestionDto);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async updateQuestion(id: string, updateQuestionDto: UpdateQuestionDto): Promise<IQuestion> {
    try {
      const question: IQuestion = await Question.findOneBy({ id });
      if (!question) {
        throw new BadRequestException("Question not found");
      }
      return Question.save({
        ...question,
        ...updateQuestionDto,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async createLesson(createLessonDto: CreateLessonDto): Promise<ILesson> {
    try {
      return Lesson.save({
        ...createLessonDto,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async updateLesson(id: number, updateLessonDto: UpdateLessonDto): Promise<ILesson> {
    const { questionTypeId } = updateLessonDto;
    try {
      const lesson = await Lesson.findOneBy({ id });
      const questionType = await QuestionType.findOneBy({ id: questionTypeId });
      if (!lesson || !questionType) {
        throw new BadRequestException("Lesson or question type not found");
      }

      return Lesson.save({
        ...lesson,
        ...updateLessonDto,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async createQuestionType(dto: CreateQuestionTypeDto): Promise<IQuestionType> {
    try {
      return QuestionType.save({
        ...dto,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getQuestionTypes(): Promise<Record<string, IQuestionType[]>> {
    try {
      const questionTypes = await QuestionType.find();
      return _.groupBy(questionTypes, (questionType: IQuestionType) => questionType.skill);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getListLessonsInQuestionType(id: number): Promise<Record<string, ILesson[]>> {
    try {
      const lessons = await Lesson.find({ where: { questionTypeId: id } });
      return _.groupBy(lessons, (lesson: ILesson) => lesson.bandScore);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async updateQuestionType(id: number, dto: UpdateQuestionTypeDto) {
    try {
      const { reorderLessons, ...restDto } = dto;

      // Must be changed if use subcribers
      const questionType = await QuestionType.findOneBy({ id });

      if (!questionType) {
        throw new BadRequestException("Question type not found");
      }

      // Update question type
      const updatedQuestionType = await QuestionType.save({
        ...questionType,
        ...restDto,
      });

      if (reorderLessons) {
        // Check if all lessons are unique
        if (_.uniqBy(reorderLessons, "lessonId").length !== reorderLessons.length) {
          throw new BadRequestException("Lesson ID must be unique");
        }

        // Must ensure that order must be unique in range [1, n] by comparing 2 sorted arrays
        // Example: [1, 2, 3, 5] and [1, 2, 3, 4] => false
        if (!_.isEqual(_.sortBy(_.map(reorderLessons, "order")), _.range(1, reorderLessons.length + 1)))
          throw new BadRequestException("Order must be unique and sequential from 1 to n");

        // Check the quantity of lessons is match between request and database
        const oldLessons = await Lesson.find({ where: { questionTypeId: id, bandScore: dto.bandScore } });
        if (oldLessons.length !== reorderLessons.length) {
          throw new BadRequestException("Number of lessons is not match");
        }

        // Check if all lessons are valid
        _.sortBy(reorderLessons, "lessonId");
        _.sortBy(oldLessons, "id");

        for (let i = 0; i < reorderLessons.length; i++) {
          if (reorderLessons[i].lessonId !== oldLessons[i].id) {
            throw new BadRequestException("Lesson ID is not match with database");
          }
        }

        const lessonMap = _.map(reorderLessons, (updatedLessonOrder, index) =>
          Lesson.save({
            ...oldLessons[index],
            order: updatedLessonOrder.order,
          })
        );

        const lessons = await Promise.all(lessonMap);

        return {
          ...updatedQuestionType,
          lessons: _.sortBy(lessons, "order"),
        };
      }

      return {
        ...updatedQuestionType,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
