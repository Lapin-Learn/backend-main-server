export interface IGradingStrategy {
  evaluateBandScore(): void;
  getResults(): boolean[] | string[] | null;
  getEstimatedBandScore(): number;
}
