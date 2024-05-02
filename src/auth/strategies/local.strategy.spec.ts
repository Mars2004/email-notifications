import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  describe('validate', () => {
    it('should return a user object if validation successful', async () => {
      const user: any = { email: 'john_doe@test.com' };
      const validateUserSpy = jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue(user);

      const result: any = await localStrategy.validate(
        'john_doe@test.com',
        '1I3.o8SL@a8B#i&',
      );

      expect(validateUserSpy).toHaveBeenCalledWith(
        'john_doe@test.com',
        '1I3.o8SL@a8B#i&',
      );
      expect(result).toBe(user);
    });

    it('should throw an unauthorized exception if user is not found', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(
        localStrategy.validate('john_doe@test.com', '1I3.o8SL@a8B#i&'),
      ).rejects.toThrowError('Incorrect email or password');
    });
  });
});
