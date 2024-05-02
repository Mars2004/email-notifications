import { Test, TestingModule } from '@nestjs/testing';
import { CronService } from './cron.service';
import { EmailService } from './email.service';

describe('CronService', () => {
  let service: CronService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        {
          provide: EmailService,
          useValue: {
            sendScheduledEmails: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<CronService>(CronService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle cron every 30 seconds', () => {
    service.handleScheduledEmails();
    expect(emailService.sendScheduledEmails).toHaveBeenCalledWith();
  });
});
