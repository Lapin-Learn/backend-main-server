import { Test, TestingModule } from "@nestjs/testing";
import { FirebaseAuthService } from "../firebase-auth.service";
import { ConfigService } from "@nestjs/config";
import { FIREBASE_APP_PROVIDER } from "@app/types/constants";

describe("FirebaseAuthService", function () {
  let service: FirebaseAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthService,
        ConfigService,
        {
          provide: FIREBASE_APP_PROVIDER,
          useValue: {},
        },
      ],
    }).compile();
    service = module.get<FirebaseAuthService>(FirebaseAuthService);
  });
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
