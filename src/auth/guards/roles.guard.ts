import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesEnum } from '../../roles/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );
    if (isPublic) {
      return true; // Public route, allow access
    }

    const requiredRoles = this.reflector.get<RolesEnum[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // No specific role required, allow access
    }

    // Check if the user has at least one of the required roles
    const hasRequiredRole = true; // TODO: Implement the logic here

    return hasRequiredRole;
  }
}
