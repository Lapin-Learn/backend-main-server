import { Test, TestingModule } from "@nestjs/testing";
import { RedisService } from "./redis.service";
import { RedisModule } from "./redis.module";

describe("RedisService", () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
