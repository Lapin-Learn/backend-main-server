import { EntitySubscriberInterface, EventSubscriber } from "typeorm";
import { SkillTestSession } from "../entities";

@EventSubscriber()
export class SkillTestSessionSubscriber implements EntitySubscriberInterface<SkillTestSession> {
  listenTo(): typeof SkillTestSession {
    return SkillTestSession;
  }
}
