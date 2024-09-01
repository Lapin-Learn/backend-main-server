import { Test, TestingModule } from "@nestjs/testing";
import { DailyLessonController } from "./daily-lesson.controller";
import { DailyLessonService } from "./daily-lesson.service";

describe("DailyLessonController", () => {
  let controller: DailyLessonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyLessonController],
      providers: [DailyLessonService],
    }).compile();

    controller = module.get<DailyLessonController>(DailyLessonController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
