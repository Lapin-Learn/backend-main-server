import { Module } from "@nestjs/common";
import { DailyLessonService } from "./daily-lesson.service";
import { DailyLessonController } from "./daily-lesson.controller";

@Module({
  providers: [DailyLessonService],
  controllers: [DailyLessonController],
})
export class DailyLessonModule {}
