export function calcCarrots(duration: number): number {
  // 3 minutes
  if (duration < 3 * 60) return 20;

  // 5 minutes
  if (duration < 5 * 60) return 10;

  return 5;
}
