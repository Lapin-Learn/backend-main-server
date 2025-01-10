import { SkillTest, SkillTestSession } from "@app/database";
import { GenAIWritingScoreModel } from "@app/shared-modules/genai";
import { GENAI_FILE_MANAGER, GENAI_MANAGER } from "@app/types/constants";
import { AIWritingEvaluationDto } from "@app/types/dtos";
import { TestSessionStatusEnum } from "@app/types/enums";
import { IAIWritingQuestion, ICurrentUser } from "@app/types/interfaces";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import * as tmp from "tmp";
import * as fs from "fs";

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

  async generateScore(user: ICurrentUser, dto: AIWritingEvaluationDto) {
    try {
      const existedSession = await SkillTestSession.findOneOrFail({
        where: { id: dto.sessionId, learnerProfileId: user.profileId },
      });

      const skillTest = await SkillTest.findOneOrFail({
        where: { id: existedSession.skillTestId },
        select: ["partsContent"],
      });

      const part1 = (skillTest?.partsContent?.[0] || {}) as IAIWritingQuestion;
      const part2 = (skillTest?.partsContent?.[1] || {}) as IAIWritingQuestion;

      const part1ImgRegex = part1?.content.match(/<img[^>]+src=['"]([^'"]+)['"]/);
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

      const contentPayload = {
        "part 1 question": part1?.content || "",
        "part 1 answer": dto?.part1 || "",
        "part 2 question": part2.content || "",
        "part 2 answer": dto?.part2 || "",
        note: "the attached image belongs to part 1 question",
      };

      const response = await this.genAIWritingScoreModel.generateContent([
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

      await SkillTestSession.update(
        { id: dto.sessionId },
        {
          results: response ? response : null,
          estimatedBandScore: response?.score,
          status: TestSessionStatusEnum.FINISHED,
        }
      );

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

      return (existedSession?.results as any)?.feedback || [{}, {}];
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
