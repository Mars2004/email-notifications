import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { UserEntity } from 'src/users/entities/user.entity';
import { SendEmailDto } from './dto/send-email.dto';

const response = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
} as unknown as Response;

describe('EmailController', () => {
  let controller: EmailController;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: {
            sendOrStoreEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call sendOrStoreEmail', async () => {
    const sendOrStoreEmail = jest.spyOn(emailService, 'sendOrStoreEmail');
    const user = { id: '1' } as UserEntity;
    const sendEmailDto = {
      key: 'expiration',
      subject: 'Test Email',
      body_data: {
        id: '123',
        date: '2022-01-01',
        link: 'https://example.com',
      },
      email: ['test@test.com'],
    } as unknown as SendEmailDto;

    await controller.sendOrStoreEmail(user, sendEmailDto, response);

    expect(sendOrStoreEmail).toHaveBeenCalledWith({
      templateKey: 'expiration',
      subject: 'Test Email',
      body: {
        id: '123',
        date: '2022-01-01',
        link: 'https://example.com',
      },
      to: ['test@test.com'],
      sendAt: undefined,
      bcc: undefined,
    });
  });
});
