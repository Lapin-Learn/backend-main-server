import { NOVU_PROVIDER_TOKEN } from "@app/types/constants";
import { Inject, Injectable } from "@nestjs/common";
import { Novu } from "@novu/node";

@Injectable()
export class NovuService {
  constructor(@Inject(NOVU_PROVIDER_TOKEN) private readonly novuClient: Novu) {}

  async sendEmail(data: object, toEmail: string) {
    const res = await this.novuClient.trigger("send-mail-workflow", {
      to: {
        subscriberId: "6727412c456590b1d8992b87",
        email: toEmail,
      },
      overrides: {
        email: {
          senderName: "LapinLearn",
          integrationIdentifier: "novu-email-gDDBDg5yq",
        },
      },
      payload: {
        ...data,
      },
    });

    return res.data;
  }
}
