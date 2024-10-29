import { Inject, Injectable } from "@nestjs/common";
import { SendEmailCommand, SESClient, SESClientConfig } from "@aws-sdk/client-ses";
@Injectable()
export class MailService {
  private client: SESClient;
  constructor(@Inject("AWS_SES_CLIENT_TOKEN") readonly options: SESClientConfig) {
    this.client = new SESClient(options);
  }
  createSendEmailCommand(toAddress: string, fromAddress: string, subject: string, body: string) {
    return new SendEmailCommand({
      Destination: {
        CcAddresses: [],
        ToAddresses: [toAddress],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: body,
          },
          Text: {
            Charset: "UTF-8",
            Data: "TEXT_FORMAT_BODY",
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: fromAddress,
    });
  }
  sendMail(toEmail: string, subject: string, context: string) {
    const command = this.createSendEmailCommand(toEmail, "lapinlearnproject@gmail.com", subject, context);
    try {
      return this.client.send(command);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
