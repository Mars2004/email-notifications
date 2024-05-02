import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

import * as SendGrid from '@sendgrid/mail';
import { EmailEntity } from './entities/email.entity';
import { EmailRepository } from './repositories/email.repository';
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        ConfigService,
        {
          provide: EmailRepository,
          useValue: {
            createDelayedEmail: jest.fn(),
            getEmailsToSendBefore: jest.fn(),
            deleteDelayedEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('sendEmailImmediately', () => {
    const testSendEmailData: Partial<EmailEntity> = {
      templateKey: 'test-template-key',
      subject: 'Test Email',
      body: {
        id: '123',
        date: '2022-01-01',
        link: 'https://example.com',
      },
      to: ['test@example.com', 'test-2@example.com'],
      bcc: [],
      sendAt: new Date(),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      user: { id: 'test-user-id' },
    };

    it('should send the email message', async () => {
      await emailService.sendEmailImmediately(testSendEmailData);

      expect(SendGrid.send).toHaveBeenCalledTimes(1);
      expect(SendGrid.send).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        to: testSendEmailData!.to![0],
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        cc: testSendEmailData!.to!.slice(1),
        bcc: testSendEmailData.bcc,
        from: configService.get('SENDGRID_VERIFIED_SENDER'),
        templateId: testSendEmailData.templateKey,
        dynamicTemplateData: {
          subject: testSendEmailData.subject,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          id: testSendEmailData!.body!.id,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          date: testSendEmailData!.body!.date,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          link: testSendEmailData!.body!.link,
        },
        mailSettings: {
          sandboxMode: {
            enable: true,
          },
        },
      });
    });

    it('should throw an error if sending the email fails', async () => {
      const error = new Error('Failed to send email');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      SendGrid.send.mockRejectedValueOnce(error);

      await expect(
        emailService.sendEmailImmediately(testSendEmailData),
      ).rejects.toThrow(error);
    });
  });
});
