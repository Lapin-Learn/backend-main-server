import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from "typeorm";
import { LearnerProfile, Level } from "../entities";

@EventSubscriber()
export class LearnerSubscriber implements EntitySubscriberInterface<LearnerProfile> {
  listenTo(): typeof LearnerProfile {
    return LearnerProfile;
  }

  async afterUpdate(event: UpdateEvent<LearnerProfile>): Promise<void> {
    const { entity, manager } = event;
    const currentLevel = await manager.getRepository(Level).findOneBy({ id: entity.levelId });
    if (entity.xp >= currentLevel.xp) {
      const nextLevel = await manager.getRepository(Level).findOneBy({ id: currentLevel.id + 1 });
      entity.levelId = nextLevel.id;
      entity.xp = entity.xp - currentLevel.xp;
      entity.save();
    }
  }
}
