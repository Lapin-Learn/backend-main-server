import { VN_TIME_ZONE } from "@app/types/constants";
import { Injectable } from "@nestjs/common";
import moment from "moment-timezone";

@Injectable()
export class NotificationHelper {
  private formatRemainingToDateTime(remainingTime: number) {
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    const list = [];
    if (days > 0) list.push(days);
    if (hours > 0) list.push(hours);
    if (minutes > 0) list.push(minutes);
    if (seconds > 0) list.push(seconds);
    return list.join(":");
  }

  // TODO: Implement factory pattern to create notification data base on different topics
  buildStreakReminderNotificationData(fcmToken: string, currentStreak: number) {
    const remainingTime = this.formatRemainingToDateTime(
      moment.tz(VN_TIME_ZONE).endOf("day").diff(moment.tz(VN_TIME_ZONE), "milliseconds")
    );

    if (currentStreak === 0) {
      return {
        fcmToken,
        title: "Bạn có quên học hôm nay không?",
        body: `Chỉ còn ${remainingTime} nữa thôi để bắt đầu luyện tập IELTS!`,
      };
    }

    return {
      fcmToken,
      title: `Nối dài chuỗi ${currentStreak} ngày của bạn`,
      body: `Chỉ còn ${remainingTime} nữa thôi để duy trì chuỗi học tập liên tục của bạn!`,
    };
  }
}
