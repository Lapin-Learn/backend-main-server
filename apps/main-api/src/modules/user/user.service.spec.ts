import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { FirebaseAuthService } from "@app/shared-modules/firebase";
import { ConfigService } from "@nestjs/config";
import { S3_PROVIDER_NAME } from "../bucket/test/constants/s3-provider.const";
import { S3 } from "@aws-sdk/client-s3";
import { BucketService } from "../bucket/bucket.service";
import { RedisService } from "@app/shared-modules/redis";
import MockRedisService from "@app/shared-modules/redis/__mocks__/redis.service";

describe("UserService", () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        BucketService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: S3_PROVIDER_NAME,
          useFactory: () => S3,
        },
        {
          provide: RedisService,
          useClass: MockRedisService,
        },
        {
          provide: FirebaseAuthService,
          useValue: {
            verifyIdToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
