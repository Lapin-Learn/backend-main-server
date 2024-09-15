export function calcXP(correctAnswers: number, wrongAnswers: number): number {
  const totalAnswers = correctAnswers + wrongAnswers;
  return Math.round(50 * (correctAnswers / totalAnswers));
}
