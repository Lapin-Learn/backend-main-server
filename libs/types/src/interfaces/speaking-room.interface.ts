import { ISpeakingRoomEvaluation } from "./speaking-room-evaluations.interface";

export interface ISpeakingRoom {
  id: string;
  content: object;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  speakingRoomEvaluations: ISpeakingRoomEvaluation[];
}
