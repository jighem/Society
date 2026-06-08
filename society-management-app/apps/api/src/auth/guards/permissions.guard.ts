import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '@society/shared';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication identity not found in request context.');
    }

    // High performance Role & Permission DB resolution
    const userWithPermissions = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!userWithPermissions || !userWithPermissions.isActive) {
      throw new ForbiddenException('User is suspended, inactive, or not present.');
    }

    const userPermissionCodes = userWithPermissions.role.permissions.map(
      (rp) => rp.permission.code as Permission,
    );

    // Super Admin has absolute system permissions bypass
    const isSuperAdmin = userWithPermissions.role.name === 'SUPER_ADMIN';
    if (isSuperAdmin) {
      return true;
    }

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissionCodes.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permissions: [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
