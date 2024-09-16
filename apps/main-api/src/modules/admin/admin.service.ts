import { Lesson, Question } from "@app/database";
import { CreateLessonDto, CreateQuestionDto, UpdateQuestionDto } from "@app/types/dtos/admin";
import { ILesson, IQuestion } from "@app/types/interfaces";
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
}
