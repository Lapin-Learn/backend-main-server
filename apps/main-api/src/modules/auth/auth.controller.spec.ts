import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { signInRequestMock } from "./test/mocks/requests.mock";
import { mock_access_token } from "./test/mocks/tokens.mock";
import { BadRequestException } from "@nestjs/common";
import { mockEmail } from "@app/shared-modules/firebase/__mocks__/firebase-auth.service";
import { VerifyOtpDto } from "@app/types/dtos";
import { ActionEnum } from "@app/types/enums";

jest.mock("./auth.service");
describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
  it("AuthService should be defined", () => {
    expect(authService).toBeDefined();
  });

  describe("signIn", () => {
    it("signIn should be defined", () => {
      expect(controller.signIn).toBeDefined();
    });
    it("should sign in a user and return an access token", async () => {
      const response = await controller.signIn(signInRequestMock);
      expect(response).toEqual({
        accessToken: mock_access_token,
      });
    });
    it("should throw an error when the user is not found", async () => {
      jest.spyOn(authService, "login").mockRejectedValue(new BadRequestException("User not found"));
      const response = controller.signIn(signInRequestMock);
      expect(authService.login).toHaveBeenCalledWith(signInRequestMock.email, signInRequestMock.password);
      await expect(response).rejects.toThrow(BadRequestException);
    });
  });

  describe("signUp", () => {
    it("signUp should be defined", () => {
      expect(controller.signUp).toBeDefined();
    });
    it("should sign up a user", async () => {
      const response = await controller.signUp(signInRequestMock);
      expect(authService.registerUser).toHaveBeenCalledWith(signInRequestMock.email, signInRequestMock.password);
      expect(response).toEqual({
        accessToken: mock_access_token,
      });
    });
    it("should throw an error when the user already exists", async () => {
      jest.spyOn(authService, "registerUser").mockRejectedValue(new BadRequestException("User already exists"));
      const response = controller.signUp(signInRequestMock);
      expect(authService.registerUser).toHaveBeenCalledWith(signInRequestMock.email, signInRequestMock.password);
      await expect(response).rejects.toThrow(BadRequestException);
    });
  });
  describe("sendOtp", () => {
    it("sendOtp should be defined", () => {
      expect(controller.sendOtp).toBeDefined();
    });
    it("should send otp", async () => {
      const response = await controller.sendOtp(mockEmail, ActionEnum.RESET_PASSWORD);
      expect(authService.sendOtp).toHaveBeenCalledWith(mockEmail, ActionEnum.RESET_PASSWORD);
      expect(response).toEqual(true);
    });
    it("should throw an error when the email is not found", async () => {
      jest.spyOn(authService, "sendOtp").mockRejectedValue(new BadRequestException("Email not found"));
      const response = controller.sendOtp(mockEmail, ActionEnum.RESET_PASSWORD);
      await expect(response).rejects.toThrow(BadRequestException);
    });
  });
  describe("verityOtp", () => {
    const mockOtpRequest: VerifyOtpDto = {
      email: mockEmail,
      otp: "123456",
      action: ActionEnum.RESET_PASSWORD,
    };

    it("otp should be defined", () => {
      expect(controller.verifyOtp).toBeDefined();
    });
    it("should verify otp", async () => {
      const response = await controller.verifyOtp(mockOtpRequest);
      expect(authService.verifyOtp).toHaveBeenCalledWith(
        mockOtpRequest.email,
        mockOtpRequest.otp,
        mockOtpRequest.action
      );
      expect(response).toEqual({
        accessToken: mock_access_token,
      });
    });
    it("should throw an error when the otp is invalid", async () => {
      jest.spyOn(authService, "verifyOtp").mockRejectedValue(new BadRequestException("Invalid OTP"));
      const response = controller.verifyOtp(mockOtpRequest);
      await expect(response).rejects.toThrow(BadRequestException);
    });
  });
  describe("resetPassword", () => {
    it("resetPassword should be defined", () => {
      expect(controller.resetPassword).toBeDefined();
    });
    it("should reset password", async () => {
      const response = await controller.resetPassword({ user: { uid: "123" } }, { newPassword: "123456" });
      expect(authService.updatePassword).toHaveBeenCalledWith("123", "123456");
      expect(response).toEqual({});
    });
    it("should throw an error when the uid is invalid", async () => {
      jest.spyOn(authService, "updatePassword").mockRejectedValue(new BadRequestException("Invalid uid"));
      const response = controller.resetPassword({ user: { uid: "123" } }, { newPassword: "123456" });
      await expect(response).rejects.toThrow(BadRequestException);
    });
  });
});
