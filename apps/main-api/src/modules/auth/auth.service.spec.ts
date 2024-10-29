import { Repository } from "typeorm";
import { UserRecord } from "firebase-admin/auth";
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Account } from "@app/database/entities";
import { FirebaseAuthService } from "@app/shared-modules/firebase";
import { MailService } from "@app/shared-modules/mail";
import { RedisService } from "@app/shared-modules/redis";
import { mockToken, mockUid } from "@app/shared-modules/firebase/__mocks__/firebase-auth.service";
import { AuthService } from "./auth.service";
import { AuthHelper } from "./auth.helper";
import { signInRequestMock, signUpRequestMock } from "./test/requests.mock";
import { userStub } from "../user/test/user.stub";

jest.mock("@app/shared-modules/firebase/firebase-auth.service");
jest.mock("@app/shared-modules/mail");
jest.mock("@app/shared-modules/redis");
describe("AuthService", function () {
  let service: AuthService;
  let firebaseAuthService: FirebaseAuthService;
  let authHelper: AuthHelper;
  // let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthHelper,
        FirebaseAuthService,
        MailService,
        RedisService,
        {
          provide: getRepositoryToken(Account),
          useClass: Repository,
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
    authHelper = module.get<AuthHelper>(AuthHelper);
    firebaseAuthService = module.get<FirebaseAuthService>(FirebaseAuthService);
    // mailService = module.get<MailService>(MailService);
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

  // describe("sendOtp", () => {
  //   let findOne: jest.SpyInstance;
  //   beforeEach(() => {
  //     findOne = jest.spyOn(Account, "findOne").mockResolvedValueOnce({ email: signInRequestMock.email } as Account);
  //   });
  //   it("sendOtp should be defined", () => {
  //     expect(service.sendOtp).toBeDefined();
  //   });
  //   it("should return true when the email is sent", async () => {
  //     jest.spyOn(mailService, "sendMail").mockResolvedValueOnce(
  //       Promise.resolve({
  //         $metadata: {
  //           httpStatusCode: 200,
  //           requestId: "e8e3b7fb-139e-459f-94a0-40d56171460b",
  //           extendedRequestId: undefined,
  //           cfId: undefined,
  //           attempts: 1,
  //           totalRetryDelay: 0,
  //         },
  //         MessageId: "010e0192d90b2099-cc594722-d2b2-4d2f-bfde-e4bede9f75fb-000000",
  //       }) as Promise<SendEmailCommandOutput>
  //     );
  //     const result = await service.sendOtp(signInRequestMock.email);
  //     expect(result).toBe(true);
  //   });
  //   it("should return false when the email is not exist", async () => {
  //     findOne.mockResolvedValueOnce(null);
  //     expect(service.sendOtp(signInRequestMock.email)).rejects.toThrow(BadRequestException);
  //   });
  // });
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
