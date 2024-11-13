import { mock_access_token } from "../test/mocks/tokens.mock";

export const AuthService = jest.fn().mockReturnValue({
  registerUser: jest.fn().mockResolvedValue({
    accessToken: mock_access_token,
  }),
  login: jest.fn().mockResolvedValue({
    accessToken: mock_access_token,
  }),
  verifyOtp: jest.fn().mockResolvedValue({ accessToken: mock_access_token }),
  updatePassword: jest.fn().mockResolvedValue({}),
  sendOtp: jest.fn().mockResolvedValue(true),
});
