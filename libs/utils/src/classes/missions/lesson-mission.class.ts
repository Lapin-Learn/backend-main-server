import { MissionAbstract } from "@app/types/abstracts";
import { LessonRecord } from "@app/database";
import { MissionNameEnum } from "@app/types/enums";

export class LessonMission extends MissionAbstract {
  private readonly _missionName: MissionNameEnum;
  private readonly _lessonRecordId: string;
  private readonly _additionalData: object;

  constructor(missionName: MissionNameEnum, lessonRecordId: string, additionalData?: object) {
    super();
    this._missionName = missionName;
    this._lessonRecordId = lessonRecordId;
    this._additionalData = additionalData;
  }

  isMissionCompleted(): boolean {
    switch (this._missionName) {
      case MissionNameEnum.COMPLETE_LESSON_PERFECTLY:
        return this.completeLessonPerfectly(this._lessonRecordId);
      case MissionNameEnum.COMPLETE_LESSON_WITH_PERCENTAGE_SCORE:
        return this.completeLessonWithPercentageScore(this._lessonRecordId, this._additionalData["percentage"] ?? 100);
    }
  }

  async completeLessonPerfectly(lessonRecordId: string): boolean {
    const lessonRecord = await LessonRecord.findOneBy({ id: lessonRecordId });
    if (lessonRecord) {
      return lessonRecord.isPerfectScore();
    }
  }

  async completeLessonWithPercentageScore(lessonRecordId: string, percentage: number): boolean {
    const lessonRecord = await LessonRecord.findOneBy({ id: lessonRecordId });
    if (lessonRecord) {
      return lessonRecord.isGainPercentageScore(percentage);
    }
  }
}
