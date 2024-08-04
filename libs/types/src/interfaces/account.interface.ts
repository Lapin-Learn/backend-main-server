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
  createdOn: Date;
  updatedOn: Date;

  //relationships
  readonly learnerProfile: ILearnerProfile;
}
