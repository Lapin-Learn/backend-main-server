export const FirebaseMessagingService = jest.fn().mockReturnValue({
  sendToDevice: jest.fn().mockResolvedValue({}),
  sendToTopic: jest.fn().mockResolvedValue({}),
  sendToCondition: jest.fn().mockResolvedValue({}),
  subscribeToTopic: jest.fn().mockResolvedValue({}),
  unsubscribeFromTopic: jest.fn().mockResolvedValue({}),
});
