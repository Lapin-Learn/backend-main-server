import { ILearnerProfile } from "./learner-profile.interface";
import { ISpeakingRoom } from "./speaking-room.interface";

export interface ISpeakingRoomEvaluation {
  id: string;
  speakingRoomId: string;
  profileId: string;
  part1: object;
  part2: object;
  part3: object;
  overall: object;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  speakingRoom: ISpeakingRoom;
  profile: ILearnerProfile;
}
