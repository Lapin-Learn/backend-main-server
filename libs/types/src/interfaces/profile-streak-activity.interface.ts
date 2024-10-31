export interface IProfileStrealActivity {
  email: string;
  username: string;
  currentStreak: number;
  activities: { dayLabel: string; status: string; isToday: boolean }[];
}
