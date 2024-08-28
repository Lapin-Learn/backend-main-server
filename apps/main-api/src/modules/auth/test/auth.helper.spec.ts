import { Test, TestingModule } from "@nestjs/testing";
import { AuthHelper } from "../auth.helper";
import { mockAccessToken } from "./mocks/tokens.mock";

describe("AuthHelper", () => {
  let authHelper: AuthHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthHelper],
    }).compile();

    authHelper = module.get<AuthHelper>(AuthHelper);
  });

  it("should be defined", () => {
    expect(authHelper).toBeDefined();
  });
  it("should return an object with an access token", async () => {
    const response = await authHelper.buildTokenResponse(mockAccessToken);
    expect(response).toEqual({ accessToken: mockAccessToken });
  });
});
