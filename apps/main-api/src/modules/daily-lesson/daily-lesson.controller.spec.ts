import { Test, TestingModule } from "@nestjs/testing";
import { DailyLessonController } from "./daily-lesson.controller";
import { DailyLessonService } from "./daily-lesson.service";
import { MileStonesObserver } from "@app/shared-modules/observers";
import { MISSION_SUBJECT_FACTORY, LEARNER_SUBJECT_FACTORY } from "@app/types/constants";

describe("DailyLessonController", () => {
  let controller: DailyLessonController;

  // Mock implementations
  const mockMissionSubjectFactory = jest.fn().mockImplementation(() => ({
    someMethod: jest.fn(), // Mock methods if necessary
  }));

  const mockLearnerSubjectFactory = jest.fn().mockImplementation(() => ({
    anotherMethod: jest.fn(), // Mock methods if necessary
  }));

  const mockMileStonesObserver = {
    observe: jest.fn(), // Mock methods if necessary
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyLessonController],
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

    controller = module.get<DailyLessonController>(DailyLessonController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
