import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth.response.dto';
import { AuthDto } from './dto/auth.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            signUp: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    const authDto: AuthDto = {
      email: 'test@test.com',
      password: '12345',
    };
    let mockResult: AuthResponseDto;
    let authServiceSignUpSpy: jest.SpyInstance;

    beforeEach(() => {
      mockResult = {
        message: 'User registered successfully.',
      };

      authServiceSignUpSpy = jest.spyOn(authService, 'signUp');
    });

    it('should successfully register the user', async () => {
      authServiceSignUpSpy.mockImplementation(() => Promise.resolve());
      const result = await authController.signUp(authDto);

      expect(authServiceSignUpSpy).toHaveBeenCalledWith(authDto);
      expect(result).toEqual(mockResult);
    });

    it('should throw ConflictException if user already exists', async () => {
      const mockError = {
        code: '23505',
      };
      authServiceSignUpSpy.mockImplementation(() => Promise.reject(mockError));
      await expect(authController.signUp(authDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw error', async () => {
      const mockError = {
        message: 'Error',
      };
      authServiceSignUpSpy.mockImplementation(() => Promise.reject(mockError));
      await expect(authController.signUp(authDto)).rejects.toEqual(mockError);
    });
  });

  describe('signIn', () => {
    const authDto: AuthDto = {
      email: 'test@test.com',
      password: '12345',
    };
    const mockRequest = {
      user: {
        email: 'test@test.com',
        password: 'hashed_password',
      },
      logIn: jest.fn((user, cb) => cb()),
    } as any;

    it('should successfully sign in the user', async () => {
      const result = await authController.signIn(authDto, mockRequest);

      expect(result).toEqual({
        message: 'Logged in successfully',
      });
      expect(mockRequest.logIn).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user failed to authenticate', async () => {
      const mockRequest = {
        logIn: jest.fn(),
      } as any;
      await expect(authController.signIn(authDto, mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRequest.logIn).not.toHaveBeenCalled();
    });
  });

  describe('signout', () => {
    const mockRequest = {
      session: {
        destroy: jest.fn((cb) => cb()),
      },
    } as any;
    const mockResult: AuthResponseDto = {
      message: 'Logged out successfully',
    };

    it('should successfully sign out the user', async () => {
      const result = await authController.signout(mockRequest);

      expect(result).toEqual(mockResult);
      expect(mockRequest.session.destroy).toHaveBeenCalled();
    });

    it('should throw error', async () => {
      const mockError = {
        message: 'Error',
      };
      mockRequest.session.destroy.mockImplementationOnce((cb: any) =>
        cb(mockError),
      );

      await expect(authController.signout(mockRequest)).rejects.toEqual(
        mockError,
      );
      expect(mockRequest.session.destroy).toHaveBeenCalled();
    });
  });
});
