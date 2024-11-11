export interface IProfileStreakActivity {
  userId: string;
  email: string;
  username: string;
  currentStreak: number;
  activities: { dayLabel: string; status: string; isToday: boolean }[];
}
