import { EntitySubscriberInterface, EventSubscriber } from "typeorm";
import { Account } from "../entities";

@EventSubscriber()
export class AccountSubscriber implements EntitySubscriberInterface<Account> {
  listenTo(): typeof Account {
    return Account;
  }
  /*
  async beforeInsert(event: InsertEvent<Account>): Promise<void> {
    const { entity, manager } = event;
    const { role = AccountRoleEnum.LEARNER } = entity;
    switch (role) {
      case AccountRoleEnum.LEARNER:
        const accountStreak = await manager.getRepository(Streak).save({});
        const learnerProfile = await manager.getRepository(LearnerProfile).save({
          levelId: 1,
          streakId: accountStreak.id,
        });
        entity.learnerProfileId = learnerProfile.id;
        break;
      case AccountRoleEnum.EXPERT:
        break;
      case AccountRoleEnum.ADMIN:
        break;
    }
  }
  */
}
