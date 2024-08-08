import { Account, BaseRepository } from "@app/database";
import { AccountRoleEnum } from "@app/types/enums";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { isNil } from "lodash";
import { Repository } from "typeorm";

@Injectable()
export class UserRepository extends BaseRepository<Account> {
  constructor(@InjectRepository(Account) repository: Repository<Account>) {
    super(repository);
  }

  async getAllUsers(offset: number, limit: number, role: AccountRoleEnum = undefined) {
    const [accounts, total] = await Promise.all([
      this.repository.find({
        where: isNil(role) ? {} : { role },
        skip: offset,
        take: limit,
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          role: true,
          dob: true,
          gender: true,
          createdAt: true,
        },
      }),
      this.repository.count(),
    ]);

    return { accounts, total, offset, limit };
  }

  async getUserById(id: string) {
    return this.findOne({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        dob: true,
        gender: true,
        createdAt: true,
      },
    });
  }
}
