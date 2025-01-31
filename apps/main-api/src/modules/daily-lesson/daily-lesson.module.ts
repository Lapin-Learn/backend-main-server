import { Module } from "@nestjs/common";
import { DailyLessonService } from "./daily-lesson.service";
import { DailyLessonController } from "./daily-lesson.controller";
import { SubjectModule } from "@app/shared-modules/subjects";
import { ObserverModule } from "@app/shared-modules/observers";

@Module({
  imports: [SubjectModule, ObserverModule],
  providers: [DailyLessonService],
  controllers: [DailyLessonController],
})
export class DailyLessonModule {}
