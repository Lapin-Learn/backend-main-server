import { EntitySubscriberInterface, EventSubscriber } from "typeorm";
import { LearnerProfile } from "../entities";

@EventSubscriber()
export class LearnerSubscriber implements EntitySubscriberInterface<LearnerProfile> {
  listenTo(): typeof LearnerProfile {
    return LearnerProfile;
  }
}
