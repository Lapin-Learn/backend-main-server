import { Test, TestingModule } from "@nestjs/testing";
import { NotificationService } from "./notification.service";
import { FirebaseMessagingService } from "@app/shared-modules/firebase";

jest.mock("@app/shared-modules/firebase/firebase-messaging.service");
describe("NotificationService", () => {
  let service: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationService, FirebaseMessagingService],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
