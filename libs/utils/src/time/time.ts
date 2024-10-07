export function newDateUTC(date = new Date()) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  );
}

export function getUTCBeginOfDay(date: Date, daysDiff: number = 0) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + daysDiff, 0, 0, 0, 0));
}

export function getUTCEndOfDay(date: Date, daysDiff: number = 0) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + daysDiff, 23, 59, 59, 999));
}
