import { userStub } from "../test/stubs/user.stub";

export const AuthService = jest.fn().mockReturnValue({
  createUserAccount: jest.fn().mockResolvedValue(userStub()),
  getAllUsers: jest.fn().mockResolvedValue({
    accounts: [userStub()],
    total: 1,
    offset: 0,
    limit: 10,
  }),
  getUserById: jest.fn().mockResolvedValue(userStub()),
  updateUser: jest.fn().mockResolvedValue(userStub()),
  deleteUser: jest.fn().mockResolvedValue(userStub()),
});
