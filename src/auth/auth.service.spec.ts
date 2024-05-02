import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserEntity } from '../users/entities/user.entity';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';

const user: UserEntity = {
  id: 'id-1',
  email: 'testuser@example.com',
  password: 'hashedPassword',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            getUserByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    it('should return created UserEntity', async () => {
      const authDto: AuthDto = {
        email: 'testuser@example.com',
        password: 'password123',
      };

      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue('hashedPassword' as unknown as never);
      jest.spyOn(usersService, 'createUser').mockResolvedValue(user);

      const result = await authService.signUp(authDto);

      expect(usersService.createUser).toHaveBeenCalledWith(
        'testuser@example.com',
        'hashedPassword',
      );
      expect(result).toEqual(user);
    });
  });

  describe('signIn', () => {
    it('should return user when email and password are correct', async () => {
      const authDto: AuthDto = {
        email: 'testuser@example.com',
        password: 'password123',
      };

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as unknown as never);
      jest.spyOn(authService, 'validateUser').mockResolvedValue(user);

      const result = await authService.signIn(authDto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        'testuser@example.com',
        'password123',
      );
      expect(result).toEqual(user);
    });

    it('should return null when user does not exist', async () => {
      const authDto: AuthDto = {
        email: 'testuser@example.com',
        password: 'password123',
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      const result = await authService.signIn(authDto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        'testuser@example.com',
        'password123',
      );
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const authDto: AuthDto = {
        email: 'testuser@example.com',
        password: 'password123',
      };

      jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValue(false as unknown as never);
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);
      const result = await authService.signIn(authDto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        'testuser@example.com',
        'password123',
      );
      expect(result).toBeNull();
    });
  });

  describe('validateUser', () => {
    it('should return user when email and password are correct', async () => {
      const email = 'testuser@example.com';
      const password = 'password123';

      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as unknown as never);

      const result = await authService.validateUser(email, password);

      expect(usersService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(result).toEqual(user);
    });

    it('should return null when user does not exist', async () => {
      const email = 'testuser@example.com';
      const password = 'password123';

      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(null);

      const result = await authService.validateUser(email, password);

      expect(usersService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const email = 'testuser@example.com';
      const password = 'password123';

      jest.spyOn(usersService, 'getUserByEmail').mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValue(false as unknown as never);

      const result = await authService.validateUser(email, password);

      expect(usersService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(result).toBeNull();
    });
  });
});
