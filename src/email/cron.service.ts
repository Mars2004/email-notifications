import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from './email.service';

@Injectable()
export class CronService {
  /**
   * Constructs the CronService.
   * @param emailService The email service instance.
   */
  constructor(private readonly emailService: EmailService) {}

  /**
   * Handles the cron job scheduled to run every 30 seconds.
   */
  @Cron(CronExpression.EVERY_30_SECONDS, { name: 'Send-Scheduled-Emails' })
  handleScheduledEmails(): void {
    this.emailService.sendScheduledEmails();
  }
}
