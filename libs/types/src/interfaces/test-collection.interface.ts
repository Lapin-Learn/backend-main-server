import { IBucket } from "./bucket.interface";
import { ISimulatedIeltsTest } from "./simulated-ielts-test.interface";

export interface ITestCollection {
  id: number;
  thumbnailId: string;
  name: string;
  tags: string[];
  keyword: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  thumbnail: IBucket;
  simulatedIeltsTests: ISimulatedIeltsTest[];
}
