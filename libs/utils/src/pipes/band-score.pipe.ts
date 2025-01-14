export function TransformBandScore(value: number) {
  if (!value) return value;
  const decimal = value % 1;

  if (decimal < 0.25) {
    return Math.floor(value);
  } else if (decimal >= 0.25 && decimal < 0.75) {
    return Math.floor(value) + 0.5;
  } else if (decimal >= 0.75) {
    return Math.ceil(value);
  }

  return value;
}
