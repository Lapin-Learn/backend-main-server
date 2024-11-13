import { EntitySubscriberInterface, EventSubscriber } from "typeorm";
import { LessonRecord } from "../entities";

@EventSubscriber()
export class LessonRecordSubscriber implements EntitySubscriberInterface<LessonRecord> {
  listenTo(): typeof LessonRecord {
    return LessonRecord;
  }
}
