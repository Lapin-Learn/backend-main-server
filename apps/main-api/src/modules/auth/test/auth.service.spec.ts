import { Test, TestingModule } from "@nestjs/testing";
import { FirebaseAuthService } from "@app/shared-modules/firebase";
import { AuthService } from "../auth.service";
import { AuthHelper } from "../auth.helper";
import { mockConfigService } from "./mocks/configService.mock";

describe("AuthService", function () {
  let service: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthHelper,
        {
          provide: FirebaseAuthService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
