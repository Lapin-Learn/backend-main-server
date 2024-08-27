import { Account } from "@app/database";
import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class MockHelper {
  constructor() {}

  async checkUserExist(userId: string) {
    const existedUser = await Account.findOne({ where: { id: userId } });
    if (!existedUser) {
      throw new BadRequestException("User not found");
    }

    const learnerProfile = existedUser.learnerProfile;
    if (!learnerProfile) {
      throw new BadRequestException("Learner profile not found");
    }

    return { existedUser, learnerProfile };
  }
}
