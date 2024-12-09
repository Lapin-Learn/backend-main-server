import { ITestCollection } from "./test-collection.interface";

export interface ISimulatedIeltsTest {
  id: number;
  collectionId: number;
  order: string;
  testName: string;
  createdAt: Date;
  updatedAt: Date;

  testCollection: ITestCollection;
}
