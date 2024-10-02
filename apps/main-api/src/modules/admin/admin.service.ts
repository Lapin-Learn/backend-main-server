import { Instruction, Lesson, Question, QuestionToLesson, QuestionType } from "@app/database";
import { CreateInstructionDto, UpdateInstructionDto } from "@app/types/dtos";
import {
  CreateLessonDto,
  CreateQuestionDto,
  CreateQuestionTypeDto,
  QueryParamQuestionDto,
  UpdateLessonDto,
  UpdateQuestionDto,
  UpdateQuestionTypeDto,
} from "@app/types/dtos/admin";
import { AssignQuestionsToLessonDto } from "@app/types/dtos/admin/assign-question-to-lesson.dto";
import { ILesson, IListQuestion, IQuestion, IQuestionType } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import _ from "lodash";
import { In } from "typeorm";

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

      // Must be changed if use subscribers
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
        // Check if all lessons are unique and order is sequential from 1 to n
        const lessonOrderPairs = reorderLessons.map((lesson) => `${lesson.lessonId}-${lesson.order}`);
        const lessonOrderSet = new Set(lessonOrderPairs);
        const orderValues = reorderLessons.map((lesson) => lesson.order);
        if (
          lessonOrderPairs.length !== lessonOrderSet.size ||
          Math.min(...orderValues) !== 1 ||
          Math.max(...orderValues) !== reorderLessons.length
        ) {
          throw new BadRequestException("Order must be unique and sequential from 1 to n");
        }

        // Check the quantity of lessons is match between request and database
        const oldLessons = await Lesson.find({
          where: { questionTypeId: id, bandScore: dto.bandScore },
          order: { id: "ASC" },
        });

        if (oldLessons.length !== reorderLessons.length || oldLessons.length === 0) {
          throw new BadRequestException("Quantity of lessons is not match");
        }

        const sortedReorderLessons = _.sortBy(reorderLessons, (lesson) => lesson.lessonId);

        if (!sortedReorderLessons.every((lesson) => oldLessons.find((oldLesson) => oldLesson.id === lesson.lessonId))) {
          throw new BadRequestException("Lesson ID must be match with the database");
        }

        const lessonMap = sortedReorderLessons.map((updatedLessonOrder, index) =>
          Lesson.save({
            ...oldLessons[index],
            order: updatedLessonOrder.order,
          })
        );

        const lessons = await Promise.all(lessonMap);

        return {
          ...updatedQuestionType,
          lessons: _.sortBy(lessons, (lesson) => lesson.order),
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

  async assignQuestionsToLesson(lessonId: number, dto: AssignQuestionsToLessonDto) {
    try {
      // Validate lesson
      const lesson = await Lesson.findOne({
        where: { id: lessonId },
        relations: {
          questionToLessons: true,
        },
      });
      if (!lesson) {
        throw new BadRequestException("Lesson not found");
      }

      // Check if all questions are unique
      const questionSet = new Set(dto.questions);
      if (dto.questions.length !== questionSet.size) {
        throw new BadRequestException("Questions must be unique");
      }

      // Validate questions
      const questions = await Question.find({ where: { id: In(dto.questions) } });
      if (questions.length !== dto.questions.length) {
        throw new BadRequestException("Some questions not found");
      }

      const { questionToLessons } = lesson;

      // Remove all questions not in dto.questions
      const questionsToRemove = questionToLessons.filter(
        (questionLesson) => !dto.questions.includes(questionLesson.questionId)
      );
      await QuestionToLesson.remove(questionsToRemove);

      // Update all questions in dto.questions
      return Promise.all(
        dto.questions.map(async (questionId, index) => {
          const questionLesson = questionToLessons.find((questionLesson) => questionLesson.questionId === questionId);

          return QuestionToLesson.save({
            id: questionLesson?.id,
            questionId,
            lessonId,
            order: index + 1,
          });
        })
      );
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async createInstruction(dto: CreateInstructionDto) {
    try {
      const currentInstructionForQuestionType = await Instruction.find({
        where: { questionTypeId: dto.questionTypeId },
      });
      if (dto.order !== currentInstructionForQuestionType.length + 1) {
        throw new BadRequestException(`Current order must be ${currentInstructionForQuestionType.length + 1}`);
      }

      return Instruction.save({
        ...dto,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async updateInstruction(id: string, dto: UpdateInstructionDto) {
    try {
      const instruction = await Instruction.findOne({ where: { id } });
      if (!instruction) {
        throw new BadRequestException("Instruction not found");
      }

      if (dto.order && dto.order !== instruction.order) {
        throw new BadRequestException(`Order cannot be update through this method or it must be ${instruction.order}`);
      }

      return Instruction.save({
        ...instruction,
        ...dto,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
