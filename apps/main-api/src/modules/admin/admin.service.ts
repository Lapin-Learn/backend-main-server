import { Lesson, Question, QuestionType } from "@app/database";
import {
  CreateLessonDto,
  CreateQuestionDto,
  CreateQuestionTypeDto,
  UpdateQuestionDto,
  UpdateQuestionTypeDto,
} from "@app/types/dtos/admin";
import { ILesson, IQuestion, IQuestionType } from "@app/types/interfaces";
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

  async getQuestions(): Promise<Record<string, IQuestion[]>> {
    try {
      const questions: IQuestion[] = await Question.find();
      return _.groupBy(questions, (IQuestion) => IQuestion.contentType);
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
      const { questionTypeId, bandScore, name } = createLessonDto;
      const totalLessons = await Lesson.count({
        where: { questionTypeId, bandScore },
      });
      return Lesson.save({
        questionTypeId,
        bandScore,
        name,
        order: totalLessons + 1,
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

  async getQuestionTypes(): Promise<IQuestionType[]> {
    try {
      return QuestionType.find();
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
      await QuestionType.save({
        ...questionType,
        ...restDto,
      });

      if (reorderLessons) {
        // Check if all lessons are unique
        const lessonIdMap = new Map<number, boolean>();
        reorderLessons.forEach((lesson) => {
          if (lessonIdMap.has(lesson.lessonId)) {
            throw new BadRequestException("Lesson ID must be unique");
          }
          lessonIdMap.set(lesson.lessonId, true);
        });

        // Must ensure that order must be unique in range [1, n]
        const orderMap = new Map<number, boolean>();
        reorderLessons.sort((a, b) => a.order - b.order);
        reorderLessons.forEach((lesson, index) => {
          if (lesson.order !== index + 1) {
            throw new BadRequestException("Order must be unique and sequential from 1 to n");
          }
          if (orderMap.has(lesson.order)) {
            throw new BadRequestException("Order must be unique");
          }
          orderMap.set(lesson.order, true);
        });

        // Check if all lessons are valid (questionTypeId, id) must be in the database
        const oldLessons = await Lesson.find({ where: { questionTypeId: id } });

        // Check if the length of oldLessons and reorderLessons is the same
        if (oldLessons.length !== reorderLessons.length) {
          throw new BadRequestException("Lesson length is not match");
        }

        // Check if all lessons are valid
        reorderLessons.sort((a, b) => a.lessonId - b.lessonId);
        oldLessons.sort((a, b) => a.id - b.id);

        for (let i = 0; i < reorderLessons.length; i++) {
          if (reorderLessons[i].lessonId !== oldLessons[i].id) {
            throw new BadRequestException("Lesson ID is not match");
          }
        }

        let lessons = [];
        for (let i = 0; i < reorderLessons.length; i++) {
          lessons.push(
            Lesson.save({
              ...oldLessons[i],
              order: reorderLessons[i].order,
            })
          );
        }

        lessons = await Promise.all(lessons);

        return {
          ...questionType,
          lessons,
        };
      }

      return {
        ...questionType,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
