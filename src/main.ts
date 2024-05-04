import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const appVersion = require('../package.json').version;

async function bootstrap() {
  // create NestJS application
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const configService = app.get<ConfigService>(ConfigService);

  // enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // check if application is in development or stage mode
  const nodeEnv = configService.get<string>('NODE_ENV');
  if (nodeEnv === 'local' || nodeEnv === 'stage' || nodeEnv === 'development') {
    // enable swagger
    const config = new DocumentBuilder()
      .setTitle('Email Notification Service API')
      .setDescription('The Email Notification Service API description')
      .setVersion(appVersion)
      .addSecurity('api_key', {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      })
      .build();

    // create Swagger document
    const document = SwaggerModule.createDocument(app, config);
    document.security = [{ api_key: [] }];
    SwaggerModule.setup('swagger', app, document);
  }

  // start application on given port
  await app.listen(configService.get<number>('PORT') || 3000);
}
bootstrap();
