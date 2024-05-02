import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { SessionSerializer } from './session.serializer';
import { UserEntity } from '../../users/entities/user.entity';

describe('SessionSerializer', () => {
  let serializer: SessionSerializer;
  let userService: UsersService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
        SessionSerializer,
      ],
    }).compile();

    serializer = moduleRef.get<SessionSerializer>(SessionSerializer);
    userService = moduleRef.get<UsersService>(UsersService);
  });

  describe('serializeUser', () => {
    it('should return user id', () => {
      const user = new UserEntity();
      user.id = '123';
      const done = jest.fn();

      serializer.serializeUser(user, done);

      expect(done).toHaveBeenCalledWith(null, {
        id: user.id,
      });
    });
  });

  describe('deserializeUser', () => {
    it('should find and return a user', async () => {
      const foundUser = new UserEntity();
      foundUser.id = '123';
      jest
        .spyOn(userService, 'getUserById')
        .mockImplementation(() => Promise.resolve(foundUser));
      const done = jest.fn();
      await serializer.deserializeUser('123', done);
      expect(done).toHaveBeenCalledWith(null, foundUser);
    });

    it('should return User not found error', async () => {
      jest
        .spyOn(userService, 'getUserById')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockImplementation(() => Promise.resolve(undefined));
      const done = jest.fn();
      await serializer.deserializeUser('123', done);
      expect(done).toHaveBeenCalledWith(new Error('User not found'), null);
    });

    it('should return error if getUserById throws an error', async () => {
      jest
        .spyOn(userService, 'getUserById')
        .mockImplementation(() => Promise.reject(new Error()));
      const done = jest.fn();
      await serializer.deserializeUser('123', done);
      expect(done).toHaveBeenCalledWith(expect.any(Error), null);
    });
  });
});
