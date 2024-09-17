export function calcXP(correctAnswers: number, wrongAnswers: number): number {
  const totalAnswers = correctAnswers + wrongAnswers;
  if (totalAnswers === 0) return 0;
  return Math.round(50 * (correctAnswers / totalAnswers));
}
