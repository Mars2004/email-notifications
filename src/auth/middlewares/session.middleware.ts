import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private sessionMiddleware: any;

  constructor(private readonly configService: ConfigService) {
    const redisClient = new Redis({
      host: configService.get<string>('REDIS_HOST'),
      port: configService.get<number>('REDIS_PORT'),
      password: configService.get<string>('REDIS_PASSWORD'),
    });

    this.sessionMiddleware = session({
      secret: configService.get<string>('SESSION_SECRET') || 'secret',
      resave: false,
      saveUninitialized: false,
      store: new RedisStore({ client: redisClient }),
      cookie: {
        httpOnly: true,
        secure:
          configService.get<string>('NODE_ENV') === 'production' ||
          configService.get<string>('NODE_ENV') === 'stage' /* ||
          configService.get<string>('NODE_ENV') === 'development'*/,
        sameSite: true,
        maxAge: 3600000, // 1 hour
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.sessionMiddleware(req, res, next);
  }
}
