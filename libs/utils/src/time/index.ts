import { VN_TIME_ZONE } from "@app/types/constants";
import moment from "moment-timezone";

/**
 * This function returns the beginning of the day of the current time in Vietnam time zone.
 * @param offset the time offset in days, e.g. -1 for yesterday, 0 for today, 1 for tomorrow
 * @returns date object
 * @example
 * getBeginOfOffsetDay(-1) // returns the beginning of yesterday
 * getBeginOfOffsetDay(0) // returns the beginning of today
 * getBeginOfOffsetDay(1) // returns the beginning of tomorrow
 */
export const getBeginOfOffsetDay = (offset: number = 0, date?: Date | string) => {
  return moment(date).tz(VN_TIME_ZONE).add(offset, "days").startOf("day").utc(true).toDate();
};

/**
 * This function returns the end of the day of the current time in Vietnam time zone.
 * @param offset the time offset in days, e.g. -1 for yesterday, 0 for today, 1 for tomorrow
 * @returns date object
 * @example
 * getEndOfOffsetDay(-1) // returns the end of yesterday
 * getEndOfOffsetDay(0) // returns the end of today
 * getEndOfOffsetDay(1) // returns the end of tomorrow
 */
export const getEndOfOffsetDay = (offset: number = 0, date?: Date | string) => {
  return moment(date).tz(VN_TIME_ZONE).add(offset, "days").endOf("day").utc(true).toDate();
};
