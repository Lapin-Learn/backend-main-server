import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { Account, LearnerProfile, Streak } from "../entities";

@EventSubscriber()
export class AccountSubscriber implements EntitySubscriberInterface<Account> {
  listenTo(): typeof Account {
    return Account;
  }

  async beforeInsert(event: InsertEvent<Account>): Promise<void> {
    const { entity, manager } = event;
    const accountStreak = await manager.getRepository(Streak).save({});
    const learnerProfile = await manager.getRepository(LearnerProfile).save({
      levelId: 1,
      streakId: accountStreak.id,
    });
    entity.learnerProfileId = learnerProfile.id;
  }
}
