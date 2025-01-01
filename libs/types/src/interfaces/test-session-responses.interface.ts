export interface ITestSessionResponse {
  questionNo: number;
  answer: string | null;
}

export interface ISpeakingResponse extends ITestSessionResponse {
  partNo: number;
  timeStamp: number;
}
