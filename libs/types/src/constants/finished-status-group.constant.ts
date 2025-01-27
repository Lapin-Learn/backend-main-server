import { TestSessionStatusEnum } from "../enums";

export const FINISHED_STATUSES = [
  TestSessionStatusEnum.FINISHED,
  TestSessionStatusEnum.EVALUATION_FAILED,
  TestSessionStatusEnum.NOT_EVALUATED,
  TestSessionStatusEnum.IN_EVALUATING,
];
