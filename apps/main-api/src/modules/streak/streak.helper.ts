import { IActivity } from "@app/types/interfaces";
import { getBeginOfOffsetDay } from "@app/utils/time";
import { Injectable } from "@nestjs/common";

@Injectable()
export class StreakHelper {
  buildStreakHistoryResponseData(streaks: IActivity[], frozenStreaks: IActivity[]) {
    const activities = [
      ...streaks,
      ...frozenStreaks.map((day) => ({
        date: getBeginOfOffsetDay(-1, day.finishedAt),
        ...day,
      })),
    ];
    if (!activities || activities.length === 0) return [];

    return activities.map((activity) => {
      return {
        date: getBeginOfOffsetDay(0, activity.finishedAt),
        actionName: activity.action.name,
      };
    });
  }
}
