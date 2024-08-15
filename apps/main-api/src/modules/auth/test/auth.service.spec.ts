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
import { AuthService } from "../auth.service";
import { AuthHelper } from "../auth.helper";
import { signInRequestMock, signUpRequestMock } from "./mocks/requests.mock";
import { userStub } from "../../user/test/stubs/user.stub";

jest.mock("@app/shared-modules/firebase/firebase-auth.service");
jest.mock("@app/shared-modules/mail");
jest.mock("@app/shared-modules/redis");
describe("AuthService", function () {
  let service: AuthService;
  let firebaseAuthService: FirebaseAuthService;
  let authHelper: AuthHelper;
  let mailService: MailService;
  let redisService: RedisService;

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
    mailService = module.get<MailService>(MailService);
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
      const saveSpy = jest.spyOn(Account, "save").mockResolvedValue({
        ...userStub(),
        email: signUpRequestMock.email,
      } as Account);
      jest.spyOn(firebaseAuthService, "generateCustomToken").mockResolvedValueOnce(mockToken);
      jest.spyOn(authHelper, "buildTokenResponse").mockResolvedValueOnce({ accessToken: mockToken });
      // Act
      const result = await service.registerUser(signUpRequestMock.email, signUpRequestMock.password);
      // Assert
      expect(firebaseAuthService.getUserByEmail).toHaveBeenCalledWith(signUpRequestMock.email, true);
      expect(firebaseAuthService.createUserByEmailAndPassword).toHaveBeenCalledWith(
        signUpRequestMock.email,
        signUpRequestMock.password
      );
      expect(saveSpy).toHaveBeenCalledWith({
        email: signUpRequestMock.email,
        providerId: mockUid,
        username: signUpRequestMock.email,
      });
      expect(firebaseAuthService.generateCustomToken).toHaveBeenCalled();
      expect(authHelper.buildTokenResponse).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: mockToken });
    });
  });

  describe("login", () => {
    it("login should be defined", () => {
      expect(service.login).toBeDefined();
    });
    it("should return access token when the user is logged in", async () => {
      // Arrange
      const findOne = jest.spyOn(Account, "findOne").mockResolvedValueOnce({
        ...userStub(),
        email: signInRequestMock.email,
      } as Account);
      jest.spyOn(authHelper, "buildTokenResponse").mockResolvedValueOnce({ accessToken: mockToken });
      const result = await service.login(signInRequestMock.email, signInRequestMock.password);
      const user = await firebaseAuthService.verifyUser(signInRequestMock.email, signInRequestMock.password);
      expect(firebaseAuthService.verifyUser).toHaveBeenCalledWith(signInRequestMock.email, signInRequestMock.password);
      expect(findOne).toHaveBeenCalledWith({ where: { providerId: user.localId } });
      expect(firebaseAuthService.generateCustomToken).toHaveBeenCalled();
      expect(authHelper.buildTokenResponse).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: mockToken });
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
    it("sendOtp should be defined", () => {
      expect(service.sendOtp).toBeDefined();
    });
    it("should return true when the email is sent", async () => {
      // Arrange
      jest.spyOn(mailService, "sendMail").mockResolvedValueOnce({ accepted: [signInRequestMock.email] });
      // Act
      const result = await service.sendOtp(signInRequestMock.email);
      // Assert
      expect(findOne).toHaveBeenCalledWith({ where: { email: signInRequestMock.email } });
      expect(firebaseAuthService.generateCustomToken).toHaveBeenCalled();
      expect(mailService.sendMail).toHaveBeenCalled();
      expect(redisService.delete).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    it("should return false when the email is not exist", async () => {
      // Arrange
      findOne.mockResolvedValueOnce(null);
      // Act
      // Assert
      expect(service.sendOtp(signInRequestMock.email)).rejects.toThrow(BadRequestException);
      expect(findOne).toHaveBeenCalledWith({ where: { email: signInRequestMock.email } });
    });
  });
  describe("updatePassword", () => {
    it("updatePassword should be defined", () => {
      expect(service.updatePassword).toBeDefined();
    });
    it("should return true when the password is updated", async () => {
      // Act
      await service.updatePassword(mockUid, signInRequestMock.password);
      // Assert
      expect(firebaseAuthService.changePassword).toHaveBeenCalledWith(mockUid, signInRequestMock.password);
    });
    it("should throw a BadRequestException when the user is not found", async () => {
      // Arrange
      jest.spyOn(firebaseAuthService, "changePassword").mockRejectedValueOnce(new Error("User not found"));
      // Act
      // Assert
      expect(service.updatePassword(mockUid, signInRequestMock.password)).rejects.toThrow(BadRequestException);
    });
  });
});
