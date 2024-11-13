import { Module } from "@nestjs/common";
import { LessonController } from "./lesson.controller";
import { LessonService } from "./lesson.service";
import { MissionFactoryModule } from "@app/shared-modules/mission-factory";

@Module({
  imports: [MissionFactoryModule],
  controllers: [LessonController],
  providers: [LessonService],
})
export class LessonModule {}
