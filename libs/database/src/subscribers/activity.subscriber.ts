import { EntitySubscriberInterface, EventSubscriber, InsertEvent } from "typeorm";
import { Action, Activity, LearnerProfile } from "../entities";
import { ActionNameEnum } from "@app/types/enums";

@EventSubscriber()
export class ActivitySubscriber implements EntitySubscriberInterface<Activity> {
  listenTo(): typeof Activity {
    return Activity;
  }

  async afterInsert(event: InsertEvent<Activity>): Promise<void> {
    const { entity, manager } = event;
    const { actionId, profileId } = entity;
    const activityActions = await manager.getRepository(Action).findOneBy({ id: actionId });
    const learner = await manager.getRepository(LearnerProfile).findOneBy({ id: profileId });
    switch (activityActions.name) {
      case ActionNameEnum.DAILY_LOGIN:
        learner.carrots += 10;
        learner.xp += 10;
        learner.save();
        break;
      case ActionNameEnum.TASK_COMPLETED:
        // Do something
        break;
    }
  }
}
