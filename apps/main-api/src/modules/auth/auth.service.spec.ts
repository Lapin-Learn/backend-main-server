import { Repository } from "typeorm";
import { UserRecord } from "firebase-admin/auth";
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Account } from "@app/database/entities";
import { FirebaseAuthService } from "@app/shared-modules/firebase";
import { RedisService } from "@app/shared-modules/redis";
import { mockToken, mockUid } from "@app/shared-modules/firebase/__mocks__/firebase-auth.service";
import { AuthService } from "./auth.service";
import { AuthHelper } from "./auth.helper";
import { signInRequestMock, signUpRequestMock } from "./test/requests.mock";
import { userStub } from "../user/test/user.stub";
import { NovuService } from "@app/shared-modules/novu";
import { NOVU_PROVIDER_TOKEN, REDIS_PROVIDER } from "@app/types/constants";

jest.mock("@app/shared-modules/firebase/firebase-auth.service");
jest.mock("@app/shared-modules/mail");
jest.mock("@app/shared-modules/redis");
jest.mock("@app/shared-modules/novu");

describe("AuthService", function () {
  let service: AuthService;
  let firebaseAuthService: FirebaseAuthService;
  let authHelper: AuthHelper;
  let novuService: NovuService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthHelper,
        FirebaseAuthService,
        RedisService,
        NovuService,
        {
          provide: getRepositoryToken(Account),
          useClass: Repository,
        },
        {
          provide: NOVU_PROVIDER_TOKEN,
          useValue: {
            trigger: jest.fn().mockResolvedValue({ data: { acknowledged: true } }),
          },
        },
        {
          provide: REDIS_PROVIDER,
          useValue: {
            set: jest.fn().mockResolvedValue(true),
            get: jest.fn().mockResolvedValue({ otp: "123456", resetPasswordToken: "some-token" }),
            delete: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    authHelper = module.get<AuthHelper>(AuthHelper);
    firebaseAuthService = module.get<FirebaseAuthService>(FirebaseAuthService);
    novuService = module.get<NovuService>(NovuService);
    redisService = module.get<RedisService>(RedisService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("registerUser", () => {
    it("registerUser should be defined", () => {
      expect(service.registerUser).toBeDefined();
    });
    it("should throw a BadRequestException when the email has already existed", async () => {
      expect(service.registerUser(signUpRequestMock.email, signUpRequestMock.password)).rejects.toThrow(
        BadRequestException
      );
    });
    it("should return an access token when the user is registered", async () => {
      // Arrange
      jest.spyOn(firebaseAuthService, "getUserByEmail").mockResolvedValueOnce(null);
      jest
        .spyOn(firebaseAuthService, "createUserByEmailAndPassword")
        .mockResolvedValueOnce({ email: signUpRequestMock.email, uid: mockUid } as UserRecord);
      jest.spyOn(Account, "save").mockResolvedValue({
        ...userStub(),
        email: signUpRequestMock.email,
      } as Account);
      jest.spyOn(firebaseAuthService, "generateCustomToken").mockResolvedValueOnce(mockToken);
      jest
        .spyOn(authHelper, "buildTokenResponse")
        .mockResolvedValueOnce({ accessToken: mockToken, refreshToken: mockToken });
      // Act
      const result = await service.registerUser(signUpRequestMock.email, signUpRequestMock.password);
      // Assert
      expect(result).toEqual("Sign up successfully");
    });
  });

  describe("login", () => {
    it("login should be defined", () => {
      expect(service.login).toBeDefined();
    });
    it("should return access token when the user is logged in", async () => {
      jest.spyOn(Account, "findOneOrFail").mockResolvedValueOnce({
        ...userStub(),
        email: signInRequestMock.email,
      } as Account);
      jest
        .spyOn(authHelper, "buildTokenResponse")
        .mockResolvedValueOnce({ accessToken: mockToken, refreshToken: mockToken });
      const result = await service.login(signInRequestMock.email, signInRequestMock.password);
      expect(result).toEqual({ accessToken: mockToken, refreshToken: mockToken });
    });
    it("should throw a BadRequestException when the user is not found", async () => {
      jest.spyOn(firebaseAuthService, "verifyUser").mockResolvedValueOnce(null);
      expect(service.login(signInRequestMock.email, signInRequestMock.password)).rejects.toThrow(BadRequestException);
    });
  });

  describe("sendOtp", () => {
    let findOne: jest.SpyInstance;
    beforeEach(() => {
      findOne = jest.spyOn(Account, "findOne").mockResolvedValueOnce({ email: signInRequestMock.email } as Account);
    });
    afterEach(() => {
      // Clear mocks after each test to ensure no test affects others
      jest.clearAllMocks();
    });
    it("sendOtp should be defined", () => {
      expect(service.sendOtp).toBeDefined();
    });
    it("should return true when the email is sent", async () => {
      jest.spyOn(novuService, "sendEmail").mockResolvedValueOnce({ data: { acknowledged: true } });
      jest.spyOn(redisService, "set").mockResolvedValueOnce(true);

      const result = await service.sendOtp(signInRequestMock.email);
      expect(result).toBe(true);
    });
    it("should return false when the email is not exist", async () => {
      findOne.mockResolvedValueOnce(null);
      const res = await service.sendOtp(signInRequestMock.email);
      expect(res).toBe(false);
    });
  });
  describe("updatePassword", () => {
    it("updatePassword should be defined", () => {
      expect(service.updatePassword).toBeDefined();
    });
    it("should return true when the password is updated", async () => {
      await service.updatePassword(mockUid, signInRequestMock.password);
      expect(firebaseAuthService.changePassword).toHaveBeenCalledWith(mockUid, signInRequestMock.password);
    });
    it("should throw a BadRequestException when the user is not found", async () => {
      jest.spyOn(firebaseAuthService, "changePassword").mockRejectedValueOnce(new Error("User not found"));
      try {
        await service.updatePassword(mockUid, signInRequestMock.password);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
