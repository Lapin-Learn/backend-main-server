import { Test, TestingModule } from "@nestjs/testing";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { FirebaseMessagingService } from "@app/shared-modules/firebase";

jest.mock("@app/shared-modules/firebase/firebase-messaging.service");
describe("NotificationController", () => {
  let controller: NotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [NotificationService, FirebaseMessagingService],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
