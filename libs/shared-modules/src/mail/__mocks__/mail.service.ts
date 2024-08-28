const MailService = jest.fn().mockReturnValue({
  sendMail: jest.fn().mockResolvedValue({}),
});
export default MailService;
