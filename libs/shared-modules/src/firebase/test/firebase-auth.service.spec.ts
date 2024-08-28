import { Test, TestingModule } from "@nestjs/testing";
import { FirebaseAuthService } from "../firebase-auth.service";
import { ConfigService } from "@nestjs/config";

describe("FirebaseAuthService", function () {
  let service: FirebaseAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthService,
        ConfigService,
        {
          provide: "FIREBASE_ADMIN_OPTIONS_TOKEN",
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
