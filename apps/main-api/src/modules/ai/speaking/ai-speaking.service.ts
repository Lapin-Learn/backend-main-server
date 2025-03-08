import { BadRequestException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { GenAISpeakingModel } from "@app/shared-modules/genai/model/genai-speaking-model.service";
import { GenAISpeakingScoreModel, GenAITranslateSpeakingScoreModel } from "@app/shared-modules/genai";
import { ICurrentUser } from "@app/types/interfaces";
import { SimulatedIeltsTest, SkillTest, SkillTestSession } from "@app/database";
import { InfoSpeakingResponseDto, SpeakingEvaluation } from "@app/types/dtos/simulated-tests";
import { plainToInstance } from "class-transformer";
import { CreateSkillTestDto } from "@app/types/dtos";
import { AxiosInstance } from "axios";
import { genericHttpConsumer } from "@app/utils/axios";
import { Blob } from "buffer";
import { ConfigService } from "@nestjs/config";
import { UserContent } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToMp3 } from "@app/utils/audio";
import { validate } from "class-validator";

@Injectable()
export class AISpeakingService {
  private readonly logger = new Logger(AISpeakingService.name);
  private genAISpeakingModel: GenAISpeakingModel;
  private genAISpeakingScoreEvaluationModel: GenAISpeakingScoreModel;
  private genAITranslateSpeakingScoreModel: GenAITranslateSpeakingScoreModel;
  private readonly httpService: AxiosInstance;
  private readonly EVALUATION_SERVICE_API: string = "";

  constructor(private readonly configService: ConfigService) {
    this.genAISpeakingModel = new GenAISpeakingModel(
      createOpenAI({ apiKey: this.configService.get("OPENAI_API_KEY") }).languageModel("gpt-4o")
    );
    this.genAISpeakingScoreEvaluationModel = new GenAISpeakingScoreModel(
      createOpenAI({ apiKey: this.configService.get("OPENAI_API_KEY") }).languageModel("gpt-4o-audio-preview")
    );
    this.genAITranslateSpeakingScoreModel = new GenAITranslateSpeakingScoreModel(
      createOpenAI({ apiKey: this.configService.get("OPENAI_API_KEY") }).languageModel("gpt-4o")
    );
    this.httpService = genericHttpConsumer();
    this.EVALUATION_SERVICE_API = this.configService.get("EVALUATION_SERVICE_API");
  }

  async generateQuestion(dto: CreateSkillTestDto) {
    try {
      // Validate simulated test
      await SimulatedIeltsTest.findOneOrFail({ where: { id: dto.testId } });

      const rawResult = await this.genAISpeakingModel.generateContent();
      const result = rawResult.result;
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
    downloadedUrl: URL,
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

      const { partsContent: parts } = skillTest;

      const questions = [];

      for (const part of parts as any[]) {
        questions.push(...(part?.content || []));
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
          data: downloadedUrl,
          mimeType: "audio/mpeg",
        },
      ];

      // Generate content using the AI model
      const plainEvaluations = (await this.genAISpeakingScoreEvaluationModel.generateContent(userContent))
        .result as SpeakingEvaluation[];

      const response = plainToInstance(SpeakingEvaluation, plainEvaluations);
      for (const r of response) {
        const errs = await validate(r);
        if (errs.length > 0) {
          this.logger.error("validation fail: ", errs);
        }
      }

      // Translate the AI response to English
      const translateUserContent: UserContent = [
        {
          type: "text",
          text: JSON.stringify(response),
        },
      ];

      const translatedResponse = await this.genAITranslateSpeakingScoreModel.generateContent(translateUserContent);
      const englishResponse = plainToInstance(SpeakingEvaluation, translatedResponse.result as object[]);
      for (const r of englishResponse) {
        const errs = await validate(r);
        if (errs.length > 0) {
          this.logger.error("validation fail: ", errs);
        }
      }

      englishResponse.forEach((item) => {
        item.lang = "en";
      });

      response.forEach((item) => {
        item.lang = "vi";
      });

      return [...response, ...englishResponse];
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
      this.logger.log("Call to AI service: ", this.EVALUATION_SERVICE_API);
      const response = await this.httpService.post(this.EVALUATION_SERVICE_API, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      this.logger.log("response: ", response);
      if (response.status === HttpStatus.OK) return response.data;
      return null;
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  async getAudioTranscripts(files: Array<Express.Multer.File>) {
    try {
      let transcripts: string[] = [];
      transcripts = await Promise.all(
        files.map(async (file) => {
          const mp3Buffer = await convertToMp3(Buffer.from(file.buffer), file.mimetype.split("/")[1]);
          const formData = new FormData();
          formData.append("file", new Blob([mp3Buffer]) as globalThis.Blob, "audio.mp3");
          formData.append("model", "whisper-1");
          const response = await this.httpService.post("https://api.openai.com/v1/audio/transcriptions", formData, {
            headers: {
              Authorization: `Bearer ${this.configService.get("OPENAI_API_KEY")}`,
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.status === HttpStatus.OK) return response.data.text;
          return "";
        })
      );
      return transcripts;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
