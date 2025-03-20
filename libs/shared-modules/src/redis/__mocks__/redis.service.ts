class MockRedisService {
  set = jest.fn().mockResolvedValue(true);
  get = jest.fn().mockResolvedValue({});
  delete = jest.fn().mockResolvedValue(true);
}

export default MockRedisService;
