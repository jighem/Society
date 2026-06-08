import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid login credentials provided.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('This account has been disabled. Please contact your administrator.');
    }

    // Limit maximum login failure threshold
    if (user.failedLoginAttempts >= 5) {
      // In production we would lock this temporally
      throw new ForbiddenException('Account temporarily locked due to repeated failed logins.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      // Track and persist failed logs
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } },
      });

      // Audit invalid login tries
      await this.prisma.auditLog.create({
        data: {
          action: 'AUTH_LOGIN_FAILED',
          ipAddress,
          userId: user.id,
          metadata: { reason: 'Incorrect security credentials' },
        },
      });

      throw new UnauthorizedException('Invalid login credentials provided.');
    }

    // Login successful
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      societyId: user.societyId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_123!',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_456!',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    // Reset attempts and update timestamps
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lastLoginAt: new Date(),
      },
    });

    // Record session database
    const expireTime = new Date();
    expireTime.setDate(expireTime.getDate() + 7);

    await this.prisma.userSession.create({
      data: {
        token: accessToken,
        refreshToken: refreshToken,
        expiresAt: expireTime,
        userId: user.id,
      },
    });

    // Create Audit Logs
    await this.prisma.auditLog.create({
      data: {
        action: 'AUTH_LOGIN_SUCCESS',
        ipAddress,
        userId: user.id,
        societyId: user.societyId,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        societyId: user.societyId,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_456!',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        include: { role: true },
      });

      if (!user || !user.isActive) {
        throw new ForbiddenException('User is suspended, inactive, or not present.');
      }

      // Check session
      const existingSession = await this.prisma.userSession.findUnique({
        where: { refreshToken: dto.refreshToken },
      });

      if (!existingSession) {
        throw new UnauthorizedException('Validation session not found or revoked.');
      }

      const newPayload = {
        id: user.id,
        email: user.email,
        role: user.role.name,
        societyId: user.societyId,
      };

      const accessToken = await this.jwtService.signAsync(newPayload, {
        secret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_123!',
        expiresIn: '15m',
      });

      // Update session record matching rotation strategy
      await this.prisma.userSession.update({
        where: { id: existingSession.id },
        data: { token: accessToken },
      });

      return {
        accessToken,
        refreshToken: dto.refreshToken,
      };
    } catch (err) {
      throw new UnauthorizedException('Token is invalid, expired, or corrupted.');
    }
  }

  async logout(token: string) {
    if (token) {
      // Find and delete user sessions associated with this token to perform high-fidelity logouts
      await this.prisma.userSession.deleteMany({
        where: {
          OR: [
            { token },
            { refreshToken: token },
          ],
        },
      });
    }
    return { message: 'Logged out successfully' };
  }
}
