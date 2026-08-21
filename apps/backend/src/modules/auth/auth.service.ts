import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/services/prisma.service';
import { ConfigService } from '../../config/config.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email.toLowerCase() },
          ...(dto.phone ? [{ phone: dto.phone }] : []),
        ],
      },
    });

    if (existing) {
      throw new ConflictException('A user with this email or phone already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          phone: dto.phone,
          passwordHash,
          role: dto.role,
          isActive: true,
          isVerified: dto.role === UserRole.ADMIN,
        },
      });

      if (dto.role === UserRole.CREATOR) {
        await tx.creatorProfile.create({
          data: {
            userId: createdUser.id,
            displayName: dto.displayName || dto.email.split('@')[0],
            category: dto.category || 'General',
            bio: dto.bio,
          },
        });
      } else if (dto.role === UserRole.BUSINESS) {
        await tx.businessProfile.create({
          data: {
            userId: createdUser.id,
            companyName: dto.companyName || dto.displayName || dto.email.split('@')[0],
            companyType: 'Other',
            description: dto.bio,
          },
        });
      } else if (dto.role === UserRole.ADMIN) {
        await tx.adminProfile.create({
          data: {
            userId: createdUser.id,
            permissions: { all: true, role: 'SUPER_ADMIN' },
          },
        });
      }

      return tx.user.findUnique({
        where: { id: createdUser.id },
        include: {
          creatorProfile: true,
          businessProfile: true,
          adminProfile: true,
        },
      });
    });

    if (!user) {
      throw new BadRequestException('Failed to create user');
    }

    const tokens = this.generateTokens(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        creatorProfile: true,
        businessProfile: true,
        adminProfile: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account has been suspended or deactivated');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = this.generateTokens(user);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const secret = this.configService.jwtSecret || process.env.JWT_SECRET || 'change-me-in-production';
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub || payload.id },
        include: {
          creatorProfile: true,
          businessProfile: true,
          adminProfile: true,
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User no longer active');
      }

      const tokens = this.generateTokens(user);
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        creatorProfile: {
          include: {
            socialConnections: true,
            services: true,
            portfolioItems: true,
          },
        },
        businessProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }

  private generateTokens(user: any) {
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
      creatorProfileId: user.creatorProfile?.id,
      businessProfileId: user.businessProfile?.id,
    };

    const secret = this.configService.jwtSecret || process.env.JWT_SECRET || 'change-me-in-production';

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '7d',
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, id: user.id },
      {
        secret,
        expiresIn: '30d',
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 604800, // 7 days in seconds
    };
  }
}
