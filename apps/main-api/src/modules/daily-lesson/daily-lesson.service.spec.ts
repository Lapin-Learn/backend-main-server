import { Test, TestingModule } from "@nestjs/testing";
import { DailyLessonService } from "./daily-lesson.service";

describe("DailyLessonService", () => {
  let service: DailyLessonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyLessonService],
    }).compile();

    service = module.get<DailyLessonService>(DailyLessonService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
