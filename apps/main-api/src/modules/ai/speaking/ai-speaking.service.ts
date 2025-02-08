import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { GenAISpeakingModel } from "@app/shared-modules/genai/model/genai-speaking-model.service";
import { GenAISpeakingScoreModel } from "@app/shared-modules/genai";
import { ICurrentUser } from "@app/types/interfaces";
import { SkillTest, SkillTestSession } from "@app/database";
import { InfoSpeakingResponseDto, SpeakingEvaluation } from "@app/types/dtos/simulated-tests";
import { plainToInstance } from "class-transformer";
import { CreateSkillTestDto } from "@app/types/dtos";
import { AxiosInstance } from "axios";
import { genericHttpConsumer } from "@app/utils/axios";
import { Blob } from "buffer";
import { ConfigService } from "@nestjs/config";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { UserContent } from "ai";

@Injectable()
export class AISpeakingService {
  private readonly logger = new Logger(AISpeakingService.name);
  private genAISpeakingModel: GenAISpeakingModel;
  private genAISpeakingScoreEvaluationModel: GenAISpeakingScoreModel;
  private readonly httpService: AxiosInstance;
  private readonly EVALUATION_SERVICE_API: string = "";

  constructor(private readonly configService: ConfigService) {
    this.genAISpeakingModel = new GenAISpeakingModel(
      createGoogleGenerativeAI({ apiKey: this.configService.get("GEMINI_API_KEY") }).languageModel("gemini-exp-1206")
    );
    this.genAISpeakingScoreEvaluationModel = new GenAISpeakingScoreModel(
      createGoogleGenerativeAI({ apiKey: this.configService.get("GEMINI_API_KEY") }).languageModel("gemini-exp-1206")
    );
    this.httpService = genericHttpConsumer();
    this.EVALUATION_SERVICE_API = this.configService.get("EVALUATION_SERVICE_API");
  }

  async generateQuestion(dto: CreateSkillTestDto) {
    try {
      const result = await this.genAISpeakingModel.generateContent();
      if (!result || result.length === 0) throw new Error("Invalid generated format.");
      const totalQuestions = result?.reduce(
        (
          sum: number,
          part: {
            heading: string;
            part: string;
            content: string[];
          }
        ) => sum + part.content.length,
        0
      );

      return SkillTest.save({
        testId: dto.testId,
        skill: dto.skill,
        totalQuestions,
        partsContent: result,
      });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async generateScore(
    sessionId: number,
    file: Express.Multer.File,
    info: InfoSpeakingResponseDto[]
  ): Promise<SpeakingEvaluation[]> {
    try {
      // Get current evaluation
      const existedSession = await SkillTestSession.findOneOrFail({
        where: { id: sessionId },
      });

      const skillTest = await SkillTest.findOne({
        where: { id: existedSession.skillTestId },
        select: ["partsContent"],
      });

      const { parts } = existedSession;

      const questions = [];

      for (const part of parts) {
        questions.push(skillTest.partsContent[part - 1]);
      }

      const prompt = `
      Evaluate speaking score for the following data of questions and some additional data relating to my response. 
      The additional information includes:
        - The part that the answer and question belong to, called "partNo".
        - The order of the question, which is 1-based within each part, called "questionNo".
        - The value of the timestamp showing when my response for each question ends, called "timeStamp". 

      However, I may sometimes skip parts of the speaking test. Ensure you evaluate part ${JSON.stringify(parts)} that I completed, the missing part must not in the response. 
      After evaluation each part, you should give the overall evaluation of the speaking test. The overall evaluation should be considered base on the evaluation of all the parts in speaking test. 
      If I skip some parts, you must not contain the evaluation of the missing parts answer but give the advice to do all parts for better evaluation, but make sure to have the final band score. 
      Additionally, use personal pronouns in your evaluation such that "I" refers to you and "you" refers to me.

      Below is the question and response data for evaluation:
      {
        "questions": ${JSON.stringify(questions)},
        "speakingData": ${JSON.stringify(info)}
      }. `;

      const userContent: UserContent = [
        {
          type: "text",
          text: prompt,
        },
        {
          type: "file",
          data: file.buffer,
          mimeType: file.mimetype,
        },
      ];

      // Generate content using the AI model
      const plainEvaluations = (await this.genAISpeakingScoreEvaluationModel.generateContent(
        userContent
      )) as SpeakingEvaluation[];

      return plainToInstance(SpeakingEvaluation, plainEvaluations);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getEvaluationByQuestionId(id: number, user: ICurrentUser) {
    try {
      const record = await SkillTestSession.findOneOrFail({ where: { id, learnerProfileId: user.profileId } });
      return record?.results[0] || {};
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getIpaEvaluation(file: Express.Multer.File, original: string) {
    try {
      const formData = new FormData();
      const newBlob = new Blob([file.buffer]);
      formData.append("file", newBlob as globalThis.Blob);

      formData.append("original", original);
      const response = await this.httpService.post(this.EVALUATION_SERVICE_API, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}
