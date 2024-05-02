import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GetTestUserAuthDto } from './utils/auth.utils';

const apiKey = process.env.API_KEY || 'testApiKey';

const { email, password } = GetTestUserAuthDto(true);

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/signup', () => {
    const authDto = {
      email,
      password,
    };

    it('should create a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.CREATED)
        .expect('Content-Type', /json/);

      expect(response.body.message).toBe('User registered successfully.');
    });

    it('should failed to create user when user already exists', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.CONFLICT)
        .expect('Content-Type', /json/);

      expect(response.body.error).toBe('Conflict');
      expect(response.body.message).toBe('User already exists');
    });

    it('should failed to create user without email', async () => {
      const authDto = {
        password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /json/);

      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toEqual([
        'email should not be empty',
        'email must be an email',
      ]);
    });

    it('should failed to create user with wrong email format', async () => {
      const authDto = {
        email: 'wrongemail',
        password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /json/);

      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toEqual(['email must be an email']);
    });

    it('should failed to create user without password', async () => {
      const authDto = {
        email,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.BAD_REQUEST)
        .expect('Content-Type', /json/);

      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toEqual([
        'password is not strong enough',
        'password should not be empty',
        'password must be a string',
      ]);
    });

    it('should failed with 403 when invalid api key is provided', async () => {
      const apiKey = 'invalidApiKey';
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.FORBIDDEN)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toBe('Invalid API Key');
    });

    it('should failed with 403 when api key is not provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(authDto)
        .expect(HttpStatus.FORBIDDEN)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toBe('API Key required');
    });
  });

  describe('/auth/signin', () => {
    const authDto = {
      email,
      password,
    };

    it('should authenticate user with valid credentials', async () => {
      const response = await request
        .agent(app.getHttpServer())
        .post('/auth/signin')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/);

      expect(response.header['set-cookie']).toBeDefined();
      expect(response.body.message).toEqual('Logged in successfully');

      const sessionCookie = response.headers['set-cookie'][0].split(';')[0];

      // it should be possible to sign out user
      const logoutResponse = await request
        .agent(app.getHttpServer())
        .post('/auth/signout')
        .set('x-api-key', apiKey)
        .set('Cookie', [sessionCookie])
        .send()
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/);

      expect(logoutResponse.header['set-cookie']).not.toBeDefined();
      expect(logoutResponse.body.message).toEqual('Logged out successfully');
    });

    it('should failed when user does not exists', async () => {
      const authDto = {
        email: 'notexists@test.com',
        password,
      };
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /json/);

      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Incorrect email or password');
    });

    it('should failed when wrong password is provided', async () => {
      const authDto = {
        email,
        password: 'wrongPassword1@-#&',
      };
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /json/);

      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Incorrect email or password');
    });

    it('should failed to sign in without email', async () => {
      const authDto = {
        password,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /json/);

      expect(response.body.message).toBe('Unauthorized');
      expect(response.body.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('should failed to sign in without password', async () => {
      const authDto = {
        email,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect('Content-Type', /json/);

      expect(response.body.message).toBe('Unauthorized');
      expect(response.body.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it('should failed with 403 when invalid api key is provided', async () => {
      const apiKey = 'invalidApiKey';
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.FORBIDDEN)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toBe('Invalid API Key');
    });

    it('should failed with 403 when api key is not provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send(authDto)
        .expect(HttpStatus.FORBIDDEN)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toBe('API Key required');
    });
  });

  describe('/auth/signout', () => {
    it('should failed with 403 when api key is not provided', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signout')
        .send()
        .expect(HttpStatus.FORBIDDEN)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toBe('API Key required');
    });

    it('should return 403 when not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signout')
        .send()
        .expect(HttpStatus.FORBIDDEN)
        .expect('Content-Type', /text\/html/);

      expect(response.text).toBe('API Key required');
    });

    it('should log out a user successfully', async () => {
      //const agent = request.agent(app.getHttpServer());

      const authDto = {
        email,
        password,
      };

      // it should be possible to sign in user
      const response = await request
        .agent(app.getHttpServer())
        .post('/auth/signin')
        .set('x-api-key', apiKey)
        .send(authDto)
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/);

      expect(response.header['set-cookie']).toBeDefined();
      expect(response.body.message).toEqual('Logged in successfully');

      // it should be possible to sign out user
      const sessionCookie = response.headers['set-cookie'][0].split(';')[0];
      const logoutResponse = await request
        .agent(app.getHttpServer())
        .post('/auth/signout')
        .set('x-api-key', apiKey)
        .set('Cookie', [sessionCookie])
        .send()
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/);

      expect(logoutResponse.header['set-cookie']).not.toBeDefined();
      expect(logoutResponse.body.message).toEqual('Logged out successfully');
    });
  });
});
