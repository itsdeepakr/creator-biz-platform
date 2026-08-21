import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../config/config.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

  const mockUser = {
    id: 'user-123',
    email: 'creator@example.com',
    phone: '9876543210',
    passwordHash: '$2b$10$hashedpassword',
    role: UserRole.CREATOR,
    isActive: true,
    isVerified: true,
    creatorProfile: { id: 'cp-123', displayName: 'Creator One' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      creatorProfile: { create: jest.fn() },
      businessProfile: { create: jest.fn() },
      adminProfile: { create: jest.fn() },
      $transaction: jest.fn(async (callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verifyAsync: jest.fn().mockResolvedValue({ id: 'user-123', email: 'creator@example.com' }),
          },
        },
        {
          provide: ConfigService,
          useValue: { jwtSecret: 'test-secret' },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should successfully register a new creator user', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'creator@example.com',
        phone: '9876543210',
        password: 'password123',
        role: UserRole.CREATOR,
        displayName: 'Creator One',
      });

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('creator@example.com');
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: 'creator@example.com' },
            { phone: '9876543210' },
          ],
        },
      });
    });

    it('should throw ConflictException if user email or phone already exists', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'creator@example.com',
          password: 'password123',
          role: UserRole.CREATOR,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'creator@example.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('creator@example.com');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({
          email: 'creator@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is inactive / suspended', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(
        service.login({
          email: 'creator@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('should return user without password hash', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe('user-123');
      expect(result.id).toBe('user-123');
      expect((result as any).passwordHash).toBeUndefined();
    });
  });
});
