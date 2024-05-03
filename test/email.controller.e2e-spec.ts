import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateAndSignUser, GetTestUserAuthDto } from './utils/auth.utils';

const apiKey = process.env.API_KEY || 'testApiKey';

const { email, password } = GetTestUserAuthDto(true);

describe('EmailController (e2e)', () => {
  let app: INestApplication;
  let userSessionCookie: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // create and sign in user
    userSessionCookie = await CreateAndSignUser(app, apiKey, email, password);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/email', () => {
    const sendEmailData = {
      key: 'expiration',
      subject: 'Test Email',
      body_data: {
        id: '123',
        date: '2022-01-01',
        link: 'https://example.com',
      },
      email: [email],
    };

    it('should failed when user is not authorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/email')
        .set('x-api-key', apiKey)
        .send(sendEmailData)
        .expect(HttpStatus.FORBIDDEN)
        .expect('Content-Type', /json/);

      expect(response.body.message).toBe('Forbidden resource');
      expect(response.body.statusCode).toEqual(HttpStatus.FORBIDDEN);
    });

    it('should failed with 403 when invalid api key is provided', async () => {
      const apiKey = 'invalidApiKey';
      const response = await request(app.getHttpServer())
        .post('/email')
        .set('x-api-key', apiKey)
        .set('Cookie', [userSessionCookie])
        .send(sendEmailData)
        .expect(HttpStatus.FORBIDDEN)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toBe('Invalid API Key');
    });

    it('should failed with 403 when api key is not provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/email')
        .set('Cookie', [userSessionCookie])
        .send(sendEmailData)
        .expect(HttpStatus.FORBIDDEN)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toBe('API Key required');
    });
  });
});
