import { VN_TIME_ZONE } from "@app/types/constants";
import { IActivity } from "@app/types/interfaces";
import { Injectable } from "@nestjs/common";
import moment from "moment-timezone";

@Injectable()
export class StreakHelper {
  buildStreakHistoryResponseData(activities: IActivity[]) {
    if (!activities || activities.length === 0) return [];

    const sortedActivities = activities.sort((a, b) => b.finishedAt.getTime() - a.finishedAt.getTime());

    return sortedActivities.map((activity) => {
      return {
        date: moment(activity.finishedAt).tz(VN_TIME_ZONE).startOf("day").utc(true).toDate(),
        actionName: activity.action.name,
      };
    });
  }
}
