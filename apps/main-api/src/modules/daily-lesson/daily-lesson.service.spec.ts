import { Test, TestingModule } from "@nestjs/testing";
import { DailyLessonService } from "./daily-lesson.service";
import { MISSION_SUBJECT_FACTORY, LEARNER_SUBJECT_FACTORY } from "@app/types/constants";
import { MileStonesObserver } from "@app/shared-modules/observers";

describe("DailyLessonService", () => {
  let service: DailyLessonService;

  const mockMissionSubjectFactory = jest.fn(() => ({
    someMethod: jest.fn(), // Mock methods if necessary
  }));

  const mockLearnerSubjectFactory = jest.fn(() => ({
    anotherMethod: jest.fn(), // Mock methods if necessary
  }));

  const mockMileStonesObserver = {
    observe: jest.fn(), // Mock methods if necessary
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyLessonService,
        {
          provide: MISSION_SUBJECT_FACTORY,
          useFactory: () => mockMissionSubjectFactory,
        },
        {
          provide: LEARNER_SUBJECT_FACTORY,
          useFactory: () => mockLearnerSubjectFactory,
        },
        {
          provide: MileStonesObserver,
          useValue: mockMileStonesObserver,
        },
      ],
    }).compile();

    service = module.get<DailyLessonService>(DailyLessonService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
