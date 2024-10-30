import { Inject, Injectable } from "@nestjs/common";
import { SESClient, SESClientConfig, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
@Injectable()
export class MailService {
  private client: SESClient;
  constructor(@Inject("AWS_SES_CLIENT_TOKEN") readonly options: SESClientConfig) {
    this.client = new SESClient(options);
  }
  createSendTemplateEmailCommand(toAddress: string, fromAddress: string, templateName: string, body: string) {
    return new SendTemplatedEmailCommand({
      Source: fromAddress,
      Destination: {
        ToAddresses: [toAddress],
      },
      Template: templateName,
      TemplateData: body,
    });
  }
  sendMail(toEmail: string, templateName: string, data: object) {
    const command = this.createSendTemplateEmailCommand(
      toEmail,
      "no-reply@lapinlearn.systems",
      templateName,
      JSON.stringify(data)
    );
    try {
      return this.client.send(command);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
