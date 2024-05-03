import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailRepository } from './repositories/email.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailEntity } from './entities/email.entity';

/**
 * Module for email-related functionality.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        /*SENDGRID_API_KEY: Joi.string().required(),
        SENDGRID_VERIFIED_SENDER: Joi.string().required(),
        SENDGRID_TEMPLATE_ID: Joi.string().required(),*/
        SMTP_TRANSPORT: Joi.string().required(),
        SMTP_DEFAULT_FROM: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('API_DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: configService.get<string>('SMTP_TRANSPORT'),
        defaults: {
          from: configService.get<string>('SMTP_DEFAULT_FROM'),
        },
      }),
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([EmailEntity]),
  ],
  providers: [EmailService, EmailRepository],
  exports: [EmailService],
})
export class EmailModule {}
