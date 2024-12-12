export interface IStreak {
  id: number;
  current: number;
  target: number;
  record: number;
  lastDateGainNewStreak: Date;
  createdAt: Date;
  updatedAt: Date;
}
