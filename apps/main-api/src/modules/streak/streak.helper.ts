import { IActivity } from "@app/types/interfaces";
import { getUTCBeginOfDay } from "@app/utils/time";
import { Injectable } from "@nestjs/common";

@Injectable()
export class StreakHelper {
  buildStreakHistoryResponseData(activities: IActivity[]) {
    if (!activities || activities.length === 0) return [];

    const sortedActivities = activities.sort((a, b) => b.finishedAt.getTime() - a.finishedAt.getTime());

    return sortedActivities.map((activity) => {
      return {
        // ...activity,
        date: getUTCBeginOfDay(activity.finishedAt),
        actionName: activity.action.name,
      };
    });
  }
}
