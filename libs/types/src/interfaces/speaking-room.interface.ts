export interface ISpeakingRoomContent {
  part1: string[];
  part2: string[];
  part3: string[];
}

export interface ISpeakingRoom {
  id: string;
  content: ISpeakingRoomContent;
  createdAt: Date;
  updatedAt: Date;
}
