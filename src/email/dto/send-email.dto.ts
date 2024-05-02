import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';
import { EmailEntity } from '../entities/email.entity';

/**
 * Data Transfer Object (DTO) for the body data of the email.
 * */
@ApiTags('Emails')
export class BodyData {
  @ApiProperty({ description: 'The id.' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'The date.', format: 'YYYY-MM-DD' })
  @IsString()
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'The link.' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  link: string;
}

/**
 * Data Transfer Object (DTO) for sending email.
 */
@ApiTags('Emails')
export class SendEmailDto {
  @ApiProperty({
    title: 'The template key of the email.',
    description: 'The template key of the email to fill by the data.',
    nullable: false,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    title: 'The subject of the email.',
    description: 'The subject of the email to send.',
    nullable: false,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    title: 'The date and time to send the email.',
    description: 'The date and time to send the email.',
    nullable: true,
    required: false,
  })
  delayed_send?: Date;

  @ApiProperty({
    title: 'The data to fill the email template.',
    description: 'The data to fill the email template.',
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  body_data: Record<string, unknown>;

  @ApiProperty({
    title: 'The email addresses of the recipient.',
    description: 'The email addresses of the recipient.',
    nullable: false,
    required: true,
  })
  @IsEmail({}, { each: true })
  @IsNotEmpty({ each: true })
  email: string[];

  @ApiProperty({
    title: 'The email addresses of the BCC recipient.',
    description: 'The email addresses of the BCC recipient.',
    nullable: true,
    required: false,
  })
  @IsEmail({}, { each: true })
  @IsNotEmpty({ each: true })
  bcc?: string[];
}

/**
 * Converts a SendEmailDto object to a partial EmailEntity object.
 * @param sendEmailDto - The SendEmailDto object.
 * @returns The converted partial EmailEntity object.
 */
export function dtoSendEmailToEntity(
  sendEmailDto: SendEmailDto,
): Partial<EmailEntity> {
  const emailEntity = {} as Partial<EmailEntity>;

  emailEntity.templateKey = sendEmailDto.key;
  emailEntity.subject = sendEmailDto.subject;
  emailEntity.body = sendEmailDto.body_data;
  emailEntity.to = sendEmailDto.email;
  emailEntity.bcc = sendEmailDto.bcc;
  emailEntity.sendAt = sendEmailDto.delayed_send;

  return emailEntity;
}
