import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ApiKeyMiddleware } from './api-key/api-key.middleware';
import { ApiKeyService } from './api-key/api-key.service';
import * as Joi from 'joi';
import * as passport from 'passport';
import { SessionSerializer } from './auth/serializers/session.serializer';
import { SessionMiddleware } from './auth/middlewares/session.middleware';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('local', 'development', 'production', 'stage', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        API_KEY: Joi.string().required(),
        CORS_ORIGIN: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    ApiKeyService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    SessionSerializer,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
    consumer
      .apply(SessionMiddleware, passport.initialize(), passport.session())
      .forRoutes('*');
  }
}
