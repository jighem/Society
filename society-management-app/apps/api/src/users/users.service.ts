import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        mobile: true,
        firstName: true,
        lastName: true,
        isActive: true,
        lastLoginAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        society: {
          select: {
            id: true,
            name: true,
            registrationNumber: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile requested could not be resolved.');
    }

    return user;
  }

  async findAll(societyId?: string) {
    return this.prisma.user.findMany({
      where: societyId ? { societyId } : undefined,
      select: {
        id: true,
        email: true,
        mobile: true,
        firstName: true,
        lastName: true,
        isActive: true,
        role: {
          select: { name: true },
        },
      },
    });
  }

  async setStatus(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, email: true, isActive: true },
    });
  }
}
