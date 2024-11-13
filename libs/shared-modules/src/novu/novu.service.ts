import { NOVU_PROVIDER_TOKEN } from "@app/types/constants";
import { Inject, Injectable } from "@nestjs/common";
import { Novu } from "@novu/node";

@Injectable()
export class NovuService {
  constructor(@Inject(NOVU_PROVIDER_TOKEN) private readonly novuClient: Novu) {}

  async sendEmail(data: object, userId: string, toEmail: string, workFlowId: string) {
    const res = await this.novuClient.trigger(workFlowId, {
      to: {
        subscriberId: userId,
        email: toEmail,
      },
      overrides: {
        email: {
          senderName: "LapinLearn",
        },
      },
      payload: {
        ...data,
      },
    });

    return res.data;
  }
}
