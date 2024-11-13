const mockEmail = "mockExample@gmail.com";
const mockUid = "mockUid";
const mockToken = "mockToken";
const mockIdToken = "mockIdToken";
const mockRefreshToken = "mockRefreshToken";

export const FirebaseAuthService = jest.fn().mockReturnValue({
  createUserByEmailAndPassword: jest.fn().mockResolvedValue({ email: mockEmail, mockUid }),
  getUserByEmail: jest.fn().mockResolvedValue({ email: mockEmail, uid: mockUid }),
  generateCustomToken: jest.fn().mockResolvedValue(mockToken),
  verifyUser: jest.fn().mockResolvedValue({
    localId: mockUid,
  }),
  verifyToken: jest.fn().mockResolvedValue({
    uid: mockUid,
    email: mockEmail,
  }),
  getIdToken: jest.fn().mockResolvedValue(mockIdToken),
  changePassword: jest.fn().mockResolvedValue(true),
});

export { mockEmail, mockUid, mockToken, mockIdToken, mockRefreshToken };
