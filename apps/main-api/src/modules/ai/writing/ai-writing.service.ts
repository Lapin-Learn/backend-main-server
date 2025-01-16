import { SkillTest, SkillTestSession } from "@app/database";
import { GenAIWritingScoreModel } from "@app/shared-modules/genai";
import { GENAI_FILE_MANAGER, GENAI_MANAGER } from "@app/types/constants";
import { TestSessionStatusEnum } from "@app/types/enums";
import { IAIWritingQuestion, ICurrentUser } from "@app/types/interfaces";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import * as tmp from "tmp";
import * as fs from "fs";
import { InfoTextResponseDto, WritingEvaluation } from "@app/types/dtos/simulated-tests";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class AIWritingService {
  private readonly logger = new Logger(AIWritingService.name);
  private genAIWritingScoreModel: GenAIWritingScoreModel;

  constructor(
    @Inject(GENAI_MANAGER) private readonly genAIManager: GoogleGenerativeAI,
    @Inject(GENAI_FILE_MANAGER) private readonly genAIFileManager: GoogleAIFileManager
  ) {
    this.genAIWritingScoreModel = new GenAIWritingScoreModel(this.genAIManager);
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

      let uploadResult = null;

      if (part1ImgUrl) {
        const imgResponse = await fetch(part1ImgUrl);
        const imgBuffer = await imgResponse.arrayBuffer();

        const mimeType = imgResponse.headers.get("Content-Type") || "image/jpeg";
        const extension = mimeType === "image/png" ? ".png" : ".jpeg";

        const tmpFile = tmp.fileSync({ postfix: extension });
        const tmpFilePath = tmpFile.name;

        try {
          fs.writeFileSync(tmpFilePath, Buffer.from(imgBuffer));

          // Upload the file
          uploadResult = await this.genAIFileManager.uploadFile(tmpFilePath, {
            mimeType,
          });
        } finally {
          tmpFile.removeCallback(); // Ensure cleanup
        }
      }

      const part1Answer = info.find((item) => item.questionNo === 1)?.answer || "";
      const part2Answer = info.find((item) => item.questionNo === 2)?.answer || "";

      const contentPayload = {
        part1Question: part1Question?.content || "",
        part1Answer: part1Answer,
        part2Question: part2Question?.content || "",
        part2Answer: part2Answer,
        note: "the attached image belongs to part 1 question",
      };

      const plainResponse = await this.genAIWritingScoreModel.generateContent([
        JSON.stringify(contentPayload),
        uploadResult
          ? {
              fileData: {
                fileUri: uploadResult.file.uri,
                mimeType: uploadResult.file.mimeType,
              },
            }
          : undefined,
      ]);

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
