import { Test, TestingModule } from "@nestjs/testing";
import { NovuService } from "./novu.service";
import { NOVU_PROVIDER_TOKEN } from "@app/types/constants";
import { ConfigService } from "@nestjs/config";
import { Novu } from "@novu/node";

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === "NOVU_API_KEY") return "dummy-api-key";
    return null;
  }),
};

describe("NovuService", () => {
  let service: NovuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: NOVU_PROVIDER_TOKEN,
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const apiKey = configService.get("NOVU_API_KEY");
            return new Novu(apiKey);
          },
        },
        NovuService,
      ],
    }).compile();

    service = module.get<NovuService>(NovuService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
