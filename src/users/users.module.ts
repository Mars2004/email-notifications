import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import * as Joi from 'joi';
import { UsersRepository } from './repositories/users.repository';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [
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
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        API_DATABASE_URL: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
