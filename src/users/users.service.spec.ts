import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './repositories/users.repository';
import { UserEntity } from './entities/user.entity';

const mockUsersRepository = () => ({
  createUser: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
});

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useFactory: mockUsersRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  describe('createUser', () => {
    it('calls UsersRepository.createUser() and returns a user', async () => {
      const createUserDto = {
        email: 'john.doe@example.com',
        password: 'password',
      };
      const user = new UserEntity();
      user.email = createUserDto.email;
      user.password = createUserDto.password;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usersRepository.createUser.mockResolvedValue(user);

      const result = await usersService.createUser(
        createUserDto.email,
        createUserDto.password,
      );

      expect(usersRepository.createUser).toHaveBeenCalledWith(
        createUserDto.email,
        createUserDto.password,
      );
      expect(result).toEqual(user);
    });
  });

  describe('getUserById', () => {
    it('calls UsersRepository.getUserById() and returns a user', async () => {
      const id = '1';
      const user = new UserEntity();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usersRepository.getUserById.mockResolvedValue(user);

      const result = await usersService.getUserById(id);

      expect(usersRepository.getUserById).toHaveBeenCalledWith(id);
      expect(result).toEqual(user);
    });

    it('calls UsersRepository.getUserById() and returns null if the user is not found', async () => {
      const id = '1';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usersRepository.getUserById.mockResolvedValue(null);

      const result = await usersService.getUserById(id);

      expect(usersRepository.getUserById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('calls UsersRepository.getUserByEmail() and returns a user', async () => {
      const email = 'john.doe@example.com';
      const user = new UserEntity();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usersRepository.getUserByEmail.mockResolvedValue(user);

      const result = await usersService.getUserByEmail(email);

      expect(usersRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(user);
    });

    it('calls UsersRepository.getUserByEmail() and returns null if the user is not found', async () => {
      const email = 'john.doe@example.com';
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usersRepository.getUserByEmail.mockResolvedValue(null);

      const result = await usersService.getUserByEmail(email);

      expect(usersRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });
});
