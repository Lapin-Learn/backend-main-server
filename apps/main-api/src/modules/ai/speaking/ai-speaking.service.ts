import { GENAI_FILE_MANAGER, GENAI_MANAGER } from "@app/types/constants";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import * as tmp from "tmp";
import * as fs from "fs";
import path from "path";
import DiffMatchPatch from "diff-match-patch";
import { GenAISpeakingModel } from "@app/shared-modules/genai/model/genai-speaking-model.service";
import { GenAISpeakingIPAModel, GenAISpeakingScoreModel } from "@app/shared-modules/genai";
import { ICurrentUser } from "@app/types/interfaces";
import { SkillTest, SkillTestSession, SpeakingRoom } from "@app/database";
import { InfoSpeakingResponseDto } from "@app/types/dtos/simulated-tests";
import { TestSessionStatusEnum } from "@app/types/enums";

const PUNCTUATION = "/[.,/#!$%^&*;:{}=-_`~()]/g";

@Injectable()
export class AISpeakingService {
  private readonly logger = new Logger(AISpeakingService.name);
  private genAISpeakingModel: GenAISpeakingModel;
  private genAISpeakingScoreEvaluationModel: GenAISpeakingScoreModel;
  private genAISpeechToIPAModel: GenAISpeakingIPAModel;

  constructor(
    @Inject(GENAI_MANAGER) private readonly genAIManager: GoogleGenerativeAI,
    @Inject(GENAI_FILE_MANAGER) private readonly genAIFileManager: GoogleAIFileManager
  ) {
    this.genAISpeakingModel = new GenAISpeakingModel(this.genAIManager);
    this.genAISpeakingScoreEvaluationModel = new GenAISpeakingScoreModel(this.genAIManager);
    this.genAISpeechToIPAModel = new GenAISpeakingIPAModel(this.genAIManager);
  }

  async generateQuestion() {
    try {
      const result = await this.genAISpeakingModel.generateContent();
      const speakingRoom = await SpeakingRoom.save({
        content: result?.content,
      });
      return {
        id: speakingRoom.id,
        content: result?.content,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async generateScore(sessionId: number, file: Express.Multer.File, info: InfoSpeakingResponseDto[]) {
    // Create a temporary file with automatic cleanup
    const tempFile = tmp.fileSync({ postfix: path.extname(file.originalname) });
    let geminiFileName = "";

    try {
      // Write the uploaded file buffer to the temp file
      fs.writeFileSync(tempFile.name, file.buffer);

      // Upload file using the file manager
      const uploadResult = await this.genAIFileManager.uploadFile(tempFile.name, {
        mimeType: file.mimetype,
        displayName: file.originalname,
      });
      geminiFileName = uploadResult.file.name;

      // Get current evaluation
      const existedSession = await SkillTestSession.findOneOrFail({
        where: { id: sessionId },
      });

      const skillTest = await SkillTest.findOne({
        where: { id: existedSession.skillTestId },
        select: ["partsContent"],
      });

      const { parts } = existedSession;

      let questions = {};

      for (const order of Object.values(parts)) {
        questions = { ...questions, [`part${order}`]: skillTest.partsContent[0][`part${order}`] };
      }
      questions = { ...questions, name: skillTest.partsContent[0]["name"] };

      const evaluationJson = {
        part1: {
          type: "string",
        },
        part2: {
          type: "string",
        },
        part3: {
          type: "string",
        },
        overall: {
          type: "string",
        },
      };

      const prompt = `
      Evaluate speaking score for the following data of questions and some additional data relating to my response. 
      The additional information includes:
        - The part that the answer and question belong to, called "partNo".
        - The order of the question, which is 1-based within each part, called "questionNo".
        - The value of the timestamp showing when my response for each question ends, called "timeStamp". 

      I want your evaluation for my answer to be in this format: ${JSON.stringify(evaluationJson)}. 
      However, I may sometimes skip parts of the speaking test. Ensure you evaluate based only on the parts I completed and the evaluation data should not contain the part that I did not answer. 
      Your evaluation should always include a score for each part and an overall evaluation. 
      Additionally, use personal pronouns in your evaluation such that "I" refers to you and "you" refers to me.

      Below is the question and response data for evaluation:
      {
        "questions": ${JSON.stringify(questions)},
        "speakingData": ${JSON.stringify(info)}
      }
      The output should be in a valid JSON format suitable for storing in my database.`;

      // Generate content using the AI model
      const evaluation = await this.genAISpeakingScoreEvaluationModel.generateContent([
        prompt,
        {
          fileData: {
            fileUri: uploadResult.file.uri,
            mimeType: file.mimetype,
          },
        },
      ]);

      SkillTestSession.update(
        { id: sessionId },
        {
          results: [evaluation],
          estimatedBandScore: evaluation.overall.score,
          status: TestSessionStatusEnum.FINISHED,
        }
      );

      return;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    } finally {
      tempFile.removeCallback();
      this.genAIFileManager.deleteFile(geminiFileName);
      // Delete it manually
      // Or it will automatically be adeleted after 48 hours
    }
  }

  async getQuestions() {
    try {
      return SpeakingRoom.find();
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getQuestionById(id: string) {
    try {
      return SpeakingRoom.findOneOrFail({ where: { id } });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
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

  async generateIpaEvaluation(file: Express.Multer.File, original: string) {
    // Create a temporary file with automatic cleanup
    const tempFile = tmp.fileSync({ postfix: path.extname(file.originalname) });

    try {
      // Write the uploaded file buffer to the temp file
      fs.writeFileSync(tempFile.name, file.buffer);

      // Upload file using the file manager
      const uploadResult = await this.genAIFileManager.uploadFile(tempFile.name, {
        mimeType: file.mimetype,
        displayName: file.originalname,
      });

      // Generate content using the AI model
      const speechIPAResult = await this.genAISpeechToIPAModel.generateContent([
        "Convert speech to IPA",
        {
          fileData: {
            fileUri: uploadResult.file.uri,
            mimeType: file.mimetype,
          },
        },
      ]);

      const originalIPAResult = await this.genAISpeechToIPAModel.generateContent([
        "Convert speech to IPA",
        {
          text: original,
        },
      ]);

      const speechIPA = speechIPAResult.ipa;
      const originalIPA = originalIPAResult.ipa;

      const matchingBlocks = this.getMatchingBlocks(speechIPA, originalIPA);
      const mappedStringArray = originalIPA.split("")?.map((c: string) => {
        if (c === " ") return " ";
        if (c.match(PUNCTUATION)) return "1";
        return "0";
      });

      for (const block of matchingBlocks) {
        const { start2, length } = block;
        for (let i = start2; i < start2 + length; i++)
          if (mappedStringArray[i] !== " ") {
            mappedStringArray[i] = "1";
          }
      }

      const accuracy = Math.floor(
        (mappedStringArray.filter((c: string) => c === "1" || c === " ").length / mappedStringArray.length) * 100
      );

      const wordSplits = mappedStringArray.join("").split(" ");
      const correctLetters = this.evaluateWords(wordSplits);

      return {
        original_ipa_transcript: originalIPA,
        voice_ipa_transcript: speechIPA,
        pronunciation_accuracy: accuracy,
        correct_letters: correctLetters,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  getMatchingBlocks(src: string, dest: string) {
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(src, dest);
    dmp.diff_cleanupSemantic(diffs);

    let index1 = 0;
    let index2 = 0;
    const matchingBlocks = [];

    for (const diff of diffs) {
      const [type, value] = diff;
      if (type === 0) {
        // Matching block
        matchingBlocks.push({
          start1: index1, // Start index in text1
          start2: index2, // Start index in text2
          length: value.length, // Length of the match
        });
      }

      // Update indices based on operation type
      if (type !== 1) index1 += value.length; // Skip "insert" for text1
      if (type !== -1) index2 += value.length; // Skip "delete" for text2
    }

    return matchingBlocks;
  }

  evaluateWords(wordSplits: string[]) {
    const result = []; // Store results (0, 1, or 2)

    for (const word of wordSplits) {
      const correct = word.split("").filter((char) => char === "1").length;

      if (correct === word.length) {
        result.push(2); // All '1's
      } else if (correct >= Math.round(word.length / 2)) {
        result.push(1); // At least half are '1's
      } else {
        result.push(0); // Less than half are '1's
      }
    }

    return result;
  }
}
