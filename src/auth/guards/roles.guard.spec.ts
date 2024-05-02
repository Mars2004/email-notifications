import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PUBLIC_KEY } from '../decorators/public.decorator';
import { RolesEnum } from 'src/roles/enums/role.enum';

jest.mock('@nestjs/core', () => ({
  Reflector: jest.fn(() => ({
    get: jest.fn().mockReturnValue(false),
  })),
}));

const mockSession = {
  passport: {
    user: {
      roles: [RolesEnum.Admin],
    },
  },
};

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  describe('canActivate', () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      mockContext = {
        switchToHttp: jest.fn().mockReturnThis(),
        getRequest: jest.fn().mockReturnValue({ session: {} }),
        getHandler: jest.fn().mockReturnThis(),
      } as any;
    });

    it('should allow access to public routes', () => {
      jest.spyOn(reflector, 'get').mockReturnValueOnce(true); // Set isPublic to true

      expect(guard.canActivate(mockContext)).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(PUBLIC_KEY, mockContext);
    });

    it('should allow access if no specific role is required', () => {
      jest
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .spyOn(mockContext, 'getRequest')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce({ session: mockSession });

      expect(guard.canActivate(mockContext)).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(PUBLIC_KEY, mockContext);
      expect(reflector.get).toHaveBeenCalledWith(ROLES_KEY, mockContext);
    });

    it('should allow access if user has at least one of the required roles', () => {
      jest
        .spyOn(reflector, 'get')
        .mockReturnValueOnce(false) // Set isPublic to false
        .mockReturnValueOnce([RolesEnum.Admin]); // Set required roles
      jest
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .spyOn(mockContext, 'getRequest')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockReturnValueOnce({ session: mockSession });
      jest.spyOn(reflector, 'get').mockReturnValueOnce([RolesEnum.Admin]); // Set required roles

      expect(guard.canActivate(mockContext)).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(PUBLIC_KEY, mockContext);
      expect(reflector.get).toHaveBeenCalledWith(ROLES_KEY, mockContext);
    });
  });
});
