import { SkillEnum } from "@app/types/enums";
import { IBandScoreRange, IGradingStrategy, TestAnswer } from "@app/types/interfaces";
import { bandScoreRangeMap } from "@app/utils/maps";
import { InfoSpeakingResponseDto, InfoTextResponseDto } from "@app/types/dtos/simulated-tests";
import { Queue } from "bullmq";
import { plainToInstance } from "class-transformer";

export class RangeGradingStrategy implements IGradingStrategy {
  private ranges: IBandScoreRange[];
  private estimatedBandScore: number;
  private testAnswers: TestAnswer[];
  private userResponses: InfoTextResponseDto[];
  private results: boolean[];
  private DEFAULT_BAND_SCORE = 2.5;

  constructor(testAnswers: TestAnswer[], userResponses: InfoTextResponseDto[], skill: SkillEnum) {
    this.testAnswers = testAnswers;
    this.userResponses = userResponses;
    this.ranges = bandScoreRangeMap.get(skill);
  }

  setRange(skill: SkillEnum) {
    this.ranges = bandScoreRangeMap.get(skill);
  }
  private validateAnswers() {
    const results: boolean[] = [];
    if (this.testAnswers && this.testAnswers.length > 0) {
      this.userResponses.map((r) => {
        const plainAnswer = this.testAnswers[r.questionNo - 1];
        if (plainAnswer) {
          const validator = plainToInstance(TestAnswer, { validation: { ...plainAnswer } });
          results.push(validator.validate(r.answer));
        }
      });
    }
    return results;
  }

  getResults() {
    return this.results;
  }

  evaluateBandScore() {
    this.results = this.validateAnswers();
    const correctAnswer = this.results.filter((value) => value === true).length;
    this.estimatedBandScore =
      this.ranges.find((s) => correctAnswer >= s.min && correctAnswer <= s.max)?.band ?? this.DEFAULT_BAND_SCORE;
    return;
  }

  getEstimatedBandScore() {
    return this.estimatedBandScore;
  }
}

export class EvaluateSpeaking implements IGradingStrategy {
  private sessionId: number;
  private speakingFiles: Array<Express.Multer.File>;
  private userResponses: InfoSpeakingResponseDto[];
  private jobName: string;
  private queue: Queue;
  constructor(
    queue: Queue,
    sessionId: number,
    jobName: string,
    speakingFiles: Array<Express.Multer.File>,
    userResponses: InfoSpeakingResponseDto[]
  ) {
    this.sessionId = sessionId;
    this.jobName = jobName;
    this.speakingFiles = speakingFiles;
    this.userResponses = userResponses;
    this.queue = queue;
  }

  async evaluateBandScore() {
    await this.queue.add(this.jobName, {
      sessionId: this.sessionId,
      userResponse: this.userResponses,
      speakingFiles: this.speakingFiles,
    });
  }

  getResults() {
    return null;
  }

  getEstimatedBandScore() {
    return null;
  }
}

export class EvaluateWriting implements IGradingStrategy {
  private sessionId: number;
  private userResponses: InfoTextResponseDto[];
  private jobName: string;
  private readonly queue: Queue;
  constructor(queue: Queue, sessionId: number, jobName: string, userResponses: InfoTextResponseDto[]) {
    this.sessionId = sessionId;
    this.userResponses = userResponses;
    this.jobName = jobName;
    this.queue = queue;
  }

  async evaluateBandScore() {
    await this.queue.add(this.jobName, {
      sessionId: this.sessionId,
      userResponse: this.userResponses,
    });
  }

  getResults() {
    return null;
  }

  getEstimatedBandScore() {
    return 0;
  }
}
