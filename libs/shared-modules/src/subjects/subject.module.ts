import { Module } from "@nestjs/common";
import { LearnerProfileSubject } from "./learner.subject";
import { MileStonesObserver, ObserverModule } from "../observers";
import { QuestHandlerContainer, QuestHandlerModule } from "../quest-handlers";
import { MissionSubject } from "./mission.subject";
import { LEARNER_SUBJECT_FACTORY, MISSION_SUBJECT_FACTORY } from "@app/types/constants";

@Module({
  imports: [ObserverModule, QuestHandlerModule],
  providers: [
    LearnerProfileSubject,
    {
      provide: MISSION_SUBJECT_FACTORY,
      useFactory: (questHandlerContainer: QuestHandlerContainer) => {
        return (observer: MileStonesObserver) => new MissionSubject(observer, questHandlerContainer);
      },
      inject: [QuestHandlerContainer],
    },
    {
      provide: LEARNER_SUBJECT_FACTORY,
      useFactory: () => {
        return (observer: MileStonesObserver) => new LearnerProfileSubject(observer);
      },
    },
  ],
  exports: [MISSION_SUBJECT_FACTORY, LEARNER_SUBJECT_FACTORY],
})
export class SubjectModule {}
