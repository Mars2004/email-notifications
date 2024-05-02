import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let userRepository: Repository<UserEntity>;

  const user = {
    id: '1',
    email: 'test@test.com',
    password: 'testpassword',
    phoneNumber: '+420123456789',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            save: jest.fn().mockResolvedValue(user),
            findOne: jest.fn(() => {
              if (user.id) {
                return user;
              }
              return null;
            }),
          },
        },
        {
          provide: DataSource,
          useValue: jest.fn,
        },
      ],
    }).compile();

    usersRepository = moduleRef.get<UsersRepository>(UsersRepository);
    userRepository = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  describe('createUser', () => {
    it('should create and return new user', async () => {
      const newUser = await usersRepository.createUser(
        user.email,
        user.password,
      );
      expect(newUser).toEqual(user);
      expect(userRepository.save).toHaveBeenCalledWith({
        email: user.email,
        password: user.password,
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const result = await usersRepository.getUserById(user.id);
      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await usersRepository.getUserById('2');
      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: '2' },
      });
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const result = await usersRepository.getUserByEmail(user.email);
      expect(result).toEqual(user);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      const result = await usersRepository.getUserByEmail('test@test.com');
      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
      });
    });
  });
});
