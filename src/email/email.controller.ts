import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import User from '../users/decorators/user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import { EmailService } from './email.service';
import { SendEmailDto, dtoSendEmailToEntity } from './dto/send-email.dto';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  /**
   * The logger instance.
   */
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * Send or store email
   */
  @Post()
  @ApiOperation({
    summary: 'Send or store email.',
    description: 'Sends or stores email for delayed send.',
  })
  @ApiSecurity('api_key')
  @ApiResponse({ status: 200, description: 'The email was immediatelly sent.' })
  @ApiResponse({
    status: 202,
    description: 'The email was stored for delayed send.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Missing API key header.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async sendOrStoreEmail(
    @User() user: UserEntity,
    @Body() sendEmailDto: SendEmailDto,
    @Res() response: Response,
  ): Promise<void> {
    this.logger.log('Received send email request: ', {
      userId: user.id,
      sendEmailDto,
    });

    // convert DTO to entity and assign user
    const sendEmailPartialEntity = dtoSendEmailToEntity(sendEmailDto);
    sendEmailPartialEntity.user = user;

    const delayedEmail = await this.emailService.sendOrStoreEmail(
      dtoSendEmailToEntity(sendEmailDto),
    );

    if (delayedEmail) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      response.status(HttpStatus.ACCEPTED).send('Email will be sent later.');
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      response.status(HttpStatus.OK).send('Email sent immediately.');
    }
  }
}
