import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SendGrid = require('@sendgrid/mail');
import { EmailEntity } from './entities/email.entity';
import { EmailRepository } from './repositories/email.repository';

/**
 * Service for sending email messages.
 */
@Injectable()
export class EmailService {
  /**
   * The logger instance.
   */
  private readonly logger = new Logger(EmailService.name);

  /**
   * Indicates whether the service is in sandbox mode.
   * If true, the email messages are not sent.
   * If false, the email messages are sent.
   * @private
   * @readonly
   * @type {boolean}
   * @memberof EmailService
   * @see https://sendgrid.com/docs/for-developers/sending-email/sandbox-mode/
   */
  private readonly sandboxMode: boolean;

  /**
   * Constructs the EmailService.
   * @param emailRepository The email repository instance.
   * @param configService The config service instance.
   */
  constructor(
    private readonly emailRepository: EmailRepository,
    private readonly configService: ConfigService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    SendGrid.setApiKey(this.configService.get('SENDGRID_API_KEY')!);

    // set sandbox mode based on the environment
    const nodeEnv = this.configService.get('NODE_ENV');
    this.sandboxMode = !(
      nodeEnv === 'development' ||
      nodeEnv === 'stage' ||
      nodeEnv === 'production'
    );
  }

  /**
   * Sends an email message.
   * @param sendEmailDto The email message data.
   */
  public async sendEmailImmediately(
    sendEmailDto: Partial<EmailEntity>,
  ): Promise<void> {
    try {
      if (!sendEmailDto.to || sendEmailDto.to.length === 0) {
        throw new Error('No recipient specified');
      }

      const msg = {
        to: sendEmailDto.to[0],
        // without the first recipient, which is the primary recipient
        cc: sendEmailDto.to.slice(1),
        bcc: sendEmailDto.bcc,
        from: this.configService.get('SENDGRID_VERIFIED_SENDER'),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        templateId: sendEmailDto.templateKey!,
        dynamicTemplateData: {
          subject: sendEmailDto.subject,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: sendEmailDto!.body!.id,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          date: sendEmailDto!.body!.date,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          link: sendEmailDto!.body!.link,
        },
        mailSettings: {
          sandboxMode: {
            enable: this.sandboxMode,
          },
        },
      };

      await SendGrid.send(msg);
    } catch (error) {
      this.logger.error(
        `Send email failed with error: ${JSON.stringify({
          subject: sendEmailDto.subject,
          userId: sendEmailDto.user?.id,
          error: error.toString(),
        })}`,
      );

      throw error;
    }
  }

  /**
   * Creates a new email with delayed send.
   * @param sendEmailDto - The data of the new delayed email.
   * @returns A Promise that resolves to the created EmailEntity or null when email was sent immediately.
   */
  async sendOrStoreEmail(
    sendEmailDto: Partial<EmailEntity>,
  ): Promise<EmailEntity | null> {
    if (sendEmailDto.sendAt) {
      return this.emailRepository.createDelayedEmail(sendEmailDto);
    }

    await this.sendEmailImmediately(sendEmailDto);

    return null;
  }

  /**
   * Sends all scheduled emails.
   */
  async sendScheduledEmails(): Promise<void> {
    const emails = await this.emailRepository.getEmailsToSendBefore(new Date());

    const emailsPromises = emails.map(async (email) => {
      try {
        await this.sendEmailImmediately(email);
        await this.emailRepository.deleteDelayedEmail(email.id);
      } catch (error) {
        this.logger.error(
          `Handle scheduled email failed with error: ${JSON.stringify({
            subject: email.subject,
            userId: email.user?.id,
            error: error.toString(),
          })}`,
        );
      }
    });

    await Promise.all(emailsPromises);
  }
}
