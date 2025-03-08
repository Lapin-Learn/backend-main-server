import { SkillTest, SkillTestSession } from "@app/database";
import { GenAITranslateWritingScoreModel, GenAIWritingScoreModel } from "@app/shared-modules/genai";
import { GenAIPartEnum, TestSessionStatusEnum } from "@app/types/enums";
import { IAIWritingQuestion, ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InfoTextResponseDto, WritingEvaluation } from "@app/types/dtos/simulated-tests";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ConfigService } from "@nestjs/config";
import { UserContent } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

@Injectable()
export class AIWritingService {
  private readonly logger = new Logger(AIWritingService.name);
  private genAIWritingScoreModel: GenAIWritingScoreModel;
  private genAITranslateWritingScoreModel: GenAITranslateWritingScoreModel;

  constructor(private readonly configService: ConfigService) {
    this.genAIWritingScoreModel = new GenAIWritingScoreModel(
      createOpenAI({ apiKey: this.configService.get("OPENAI_API_KEY") }).languageModel("gpt-4o")
    );

    this.genAITranslateWritingScoreModel = new GenAITranslateWritingScoreModel(
      createOpenAI({ apiKey: this.configService.get("OPENAI_API_KEY") }).languageModel("gpt-4o")
    );
  }

  async generateScore(sessionId: number, info: InfoTextResponseDto[]) {
    try {
      const existedSession = await SkillTestSession.findOneOrFail({
        where: { id: sessionId },
      });

      const skillTest = await SkillTest.findOneOrFail({
        where: { id: existedSession.skillTestId },
        select: ["partsContent"],
      });

      const part1Question = (skillTest?.partsContent?.[0] || {}) as IAIWritingQuestion;
      const part2Question = (skillTest?.partsContent?.[1] || {}) as IAIWritingQuestion;

      const part1ImgRegex = part1Question?.content.match(/<img[^>]+src=['"]([^'"]+)['"]/);
      const part1ImgUrl = part1ImgRegex ? new URL(part1ImgRegex[1]) : null;

      const part1Answer = info.find((item) => item.questionNo === 1)?.answer || "";
      const part2Answer = info.find((item) => item.questionNo === 2)?.answer || "";

      const contentPayload = `Part 1: ${part1Question.content}\n\n${part1Answer}\n\nPart 2: ${part2Question.content}\n\n${part2Answer}`;

      const userContent: UserContent = [
        {
          type: "text",
          text: contentPayload,
        },
      ];

      if (part1ImgUrl) {
        userContent.push({
          type: "image",
          image: part1ImgUrl,
        });
      }

      const plainResponse = await this.genAIWritingScoreModel.generateContent(userContent);

      const response = plainToInstance(WritingEvaluation, plainResponse.result as object[]);
      for (const r of response) {
        const errs = await validate(r);
        if (errs.length > 0) {
          this.logger.error("validation fail: ", errs);
        }
      }

      const estimatedBandScore = response
        ?.find((item) => item.part === GenAIPartEnum.OVERALL)
        ?.criterias.getOverallScore();

      // Translate the AI response to English
      const translateUserContent: UserContent = [
        {
          type: "text",
          text: JSON.stringify(plainResponse?.result),
        },
      ];

      const translatedResponse = await this.genAITranslateWritingScoreModel.generateContent(translateUserContent);
      const englishResponse = plainToInstance(WritingEvaluation, translatedResponse.result as object[]);
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

      await SkillTestSession.save({
        id: sessionId,
        results: response && englishResponse ? [...response, ...englishResponse] : null,
        estimatedBandScore,
        status: TestSessionStatusEnum.FINISHED,
      });

      return;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getFeedback(user: ICurrentUser, sessionId: number) {
    try {
      const existedSession = await SkillTestSession.findOneOrFail({
        where: { id: sessionId, learnerProfileId: user.profileId },
      });

      return existedSession?.results || [];
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
