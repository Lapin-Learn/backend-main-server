import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Account, LearnerProfile, Level, Streak } from "./entities";
import { RankEnum } from "@app/types/enums";
import { v4 as uuidv4 } from "uuid";

describe("Test create new user", () => {
  let levelRepository: Repository<Level>;
  let streakRepository: Repository<Streak>;
  let learnerProfileRepository: Repository<LearnerProfile>;
  let accountRepository: Repository<Account>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Level),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Streak),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LearnerProfile),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Account),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    levelRepository = module.get<Repository<Level>>(getRepositoryToken(Level));
    streakRepository = module.get<Repository<Streak>>(getRepositoryToken(Streak));
    learnerProfileRepository = module.get<Repository<LearnerProfile>>(getRepositoryToken(LearnerProfile));
    accountRepository = module.get<Repository<Account>>(getRepositoryToken(Account));
  });

  it("Level repository should be defined", () => {
    expect(levelRepository).toBeDefined();
  });

  it("Streak repository should be defined", () => {
    expect(streakRepository).toBeDefined();
  });

  it("Learner profile repository should be defined", () => {
    expect(learnerProfileRepository).toBeDefined();
  });

  it("Account repository should be defined", () => {
    expect(accountRepository).toBeDefined();
  });

  it("should create new user in database", async () => {
    const level = { id: 1, xp: 100 };
    const streak = { id: 0, current: 0, target: 0, record: 0 };

    levelRepository.save = jest.fn().mockResolvedValue(level);
    streakRepository.save = jest.fn().mockResolvedValue(streak);

    const learnerProfile = {
      id: uuidv4(),
      rank: RankEnum.BRONZE,
      levelId: level.id,
      xp: 0,
      carrots: 0,
      streakId: streak.id,
      level,
      streak,
    };

    learnerProfileRepository.save = jest.fn().mockResolvedValue(learnerProfile);
    learnerProfileRepository.findOne = jest.fn().mockResolvedValue(learnerProfile);

    const account = {
      id: uuidv4(),
      learnerProfileId: learnerProfile.id,
      learnerProfile,
    };
    accountRepository.save = jest.fn().mockResolvedValue(account);
    accountRepository.findOne = jest.fn().mockResolvedValue(account);

    const createdLevel = await levelRepository.save({ xp: 100 });
    expect(createdLevel).toEqual(level);

    const createdStreak = await streakRepository.save({ current: 0, target: 0, record: 0 });
    expect(createdStreak).toEqual(streak);

    const createdLearnerProfile = await learnerProfileRepository.save({
      rank: RankEnum.BRONZE,
      xp: 0,
      carrots: 0,
      streakId: createdStreak.id,
      levelId: createdLevel.id,
    });

    expect(createdLearnerProfile).toEqual(learnerProfile);

    const createdAccount = await accountRepository.save({ learnerProfileId: createdLearnerProfile.id });
    expect(createdAccount).toEqual(account);

    const foundAccount = await accountRepository.findOne({
      where: { id: createdAccount.id },
      relations: {
        learnerProfile: true,
      },
    });

    console.log(foundAccount);
    expect(foundAccount).toEqual(account);

    const foundLearnerProfile = await learnerProfileRepository.findOne({
      where: { id: createdLearnerProfile.id },
      relations: {
        level: true,
        streak: true,
      },
    });
    console.log(foundLearnerProfile);
    expect(foundLearnerProfile).toEqual(learnerProfile);
  });
});
