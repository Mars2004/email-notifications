import { HttpStatus, INestApplication } from '@nestjs/common';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';

export function GetTestUserAuthDto(random = false, isAdmin = false): AuthDto {
  const usernamePrefix = isAdmin ? 'e2e_admin' : 'e2e_user';
  const username = random ? `${usernamePrefix}_${uuid()}` : usernamePrefix;
  const userEmail = `${username}@test.com`;
  const password = '1I3.o8SL@a8B#i&';

  return { email: userEmail, password };
}

export async function CreateUser(
  app: INestApplication,
  email: string,
  password: string,
): Promise<UserEntity> {
  const usersService: UsersService = app.get<UsersService>(UsersService);
  const user = await usersService.createUser(email, password);
  return user;
}

export async function CreateAndSignUser(
  app: INestApplication,
  apiKey: string,
  email: string,
  password: string,
): Promise<string> {
  await CreateUser(app, email, password);
  const response = await request(app.getHttpServer())
    .post('/auth/signin')
    .set('x-api-key', apiKey)
    .send({
      email,
      password,
    })
    .expect(HttpStatus.OK)
    .expect('Content-Type', /json/);

  return response.headers['set-cookie'][0].split(';')[0];
}

export async function GetUserByEmail(
  app: INestApplication,
  email: string,
): Promise<UserEntity> {
  const usersService: UsersService = app.get<UsersService>(UsersService);
  const user = await usersService.getUserByEmail(email);
  if (!user) throw new Error('User not found' + email);
  return user;
}

export async function GetUserIdByEmail(
  app: INestApplication,
  email: string,
): Promise<string> {
  const user = await GetUserByEmail(app, email);
  return user.id;
}
