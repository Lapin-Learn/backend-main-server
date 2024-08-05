import { AccountRoleEnum, GenderEnum } from "../enums";
import { ILearnerProfile } from "./learner-profile.interface";

export interface IAccount {
  id: string;
  providerId: string;
  username: string;
  email: string;
  role: AccountRoleEnum;
  fullName: string;
  dob: Date;
  gender: GenderEnum;
  learnerProfileId: string;
  createdAt: Date;
  updatedAt: Date;

  //relationships
  readonly learnerProfile: ILearnerProfile;
}
