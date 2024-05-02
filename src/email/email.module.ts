import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

/**
 * Module for email-related functionality.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        SENDGRID_API_KEY: Joi.string().required(),
        SENDGRID_VERIFIED_SENDER: Joi.string().required(),
        SENDGRID_TEMPLATE_ID: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
