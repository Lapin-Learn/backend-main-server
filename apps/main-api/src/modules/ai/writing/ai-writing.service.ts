import { SkillTest, SkillTestSession } from "@app/database";
import { GenAIWritingScoreModel } from "@app/shared-modules/genai";
import { TestSessionStatusEnum } from "@app/types/enums";
import { IAIWritingQuestion, ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InfoTextResponseDto, WritingEvaluation } from "@app/types/dtos/simulated-tests";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { ConfigService } from "@nestjs/config";
import { UserContent } from "ai";

@Injectable()
export class AIWritingService {
  private readonly logger = new Logger(AIWritingService.name);
  private genAIWritingScoreModel: GenAIWritingScoreModel;

  constructor(private readonly configService: ConfigService) {
    this.genAIWritingScoreModel = new GenAIWritingScoreModel(
      createGoogleGenerativeAI({ apiKey: this.configService.get("GEMINI_API_KEY") }).languageModel("gemini-exp-1206")
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
      const part1ImgUrl = part1ImgRegex ? part1ImgRegex[1] : null;

      const part1Answer = info.find((item) => item.questionNo === 1)?.answer || "";
      const part2Answer = info.find((item) => item.questionNo === 2)?.answer || "";

      const contentPayload = {
        part1Question: part1Question?.content || "",
        part1Answer: part1Answer,
        part2Question: part2Question?.content || "",
        part2Answer: part2Answer,
        note: "the attached image belongs to part 1 question",
      };

      const userContent: UserContent = [
        {
          type: "text",
          text: JSON.stringify(contentPayload),
        },
      ];

      if (part1ImgUrl) {
        const imgResponse = await fetch(part1ImgUrl);
        const imgBuffer = await imgResponse.arrayBuffer();
        const mimeType = imgResponse.headers.get("Content-Type") || "image/jpeg";

        userContent.push({
          type: "file",
          data: imgBuffer,
          mimeType: mimeType,
        });
      }

      const plainResponse = await this.genAIWritingScoreModel.generateContent(userContent);

      const response = plainToInstance(WritingEvaluation, plainResponse as object[]);
      for (const r of response) {
        const errs = await validate(r);
        if (errs.length > 0) {
          this.logger.error("validation fail: ", errs);
        }
      }

      const estimatedBandScore = response?.find((item) => item.part === "overall")?.criterias.getOverallScore();

      await SkillTestSession.save({
        id: sessionId,
        results: response ? response : null,
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
