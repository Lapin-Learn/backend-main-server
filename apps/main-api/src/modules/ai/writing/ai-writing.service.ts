import { SkillTest, SkillTestSession } from "@app/database";
import { GenAIWritingScoreModel } from "@app/shared-modules/genai";
import { GENAI_FILE_MANAGER, GENAI_MANAGER } from "@app/types/constants";
import { AIWritingEvaluationDto } from "@app/types/dtos";
import { ICurrentUser } from "@app/types/interfaces";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { Inject, Injectable, Logger } from "@nestjs/common";

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
    const existedSession = await SkillTestSession.findOneOrFail({
      where: { id: dto.sessionId, learnerProfileId: user.profileId },
    });

    const skillTest = await SkillTest.findOneOrFail({
      where: { id: existedSession.skillTestId },
      select: ["partsContent"],
    });

    const question = skillTest?.partsContent?.[dto.part - 1];
    const response = await this.genAIWritingScoreModel.generateContent(`
      {
        "question": "${question}",
        "user answer": "${dto.data}",
      }`);

    const results = existedSession.results || [{}, {}];
    results[dto.part - 1] = response;

    await SkillTestSession.update(
      { id: dto.sessionId },
      {
        results,
        estimatedBandScore: response?.score,
      }
    );

    return response;
  }
}
