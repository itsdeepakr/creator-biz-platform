import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { AntiDisintermediationService } from './anti-disintermediation.service';
import { SendMessageDto, CreateThreadDto, ReportThreadDto } from './dto/send-message.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scanner: AntiDisintermediationService,
  ) {}

  async getConversations(userId: string, userRole: string) {
    let where: any = {};

    if (userRole === UserRole.ADMIN) {
      where = {};
    } else if (userRole === UserRole.CREATOR) {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
      if (!creator) return [];
      where = { creatorId: creator.id };
    } else if (userRole === UserRole.BUSINESS) {
      const business = await this.prisma.businessProfile.findUnique({ where: { userId } });
      if (!business) return [];
      where = { businessId: business.id };
    }

    return this.prisma.chatThread.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        business: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });
  }

  async getOrCreateThread(userId: string, userRole: string, dto: CreateThreadDto) {
    let creatorId = dto.creatorId;
    let businessId = dto.businessId;

    if (userRole === UserRole.CREATOR) {
      const creator = await this.prisma.creatorProfile.findUnique({ where: { userId } });
      if (!creator) throw new NotFoundException('Creator profile not found');
      creatorId = creator.id;
    } else if (userRole === UserRole.BUSINESS) {
      const business = await this.prisma.businessProfile.findUnique({ where: { userId } });
      if (!business) throw new NotFoundException('Business profile not found');
      businessId = business.id;
    }

    if (!creatorId || !businessId) {
      throw new BadRequestException('Both creatorId and businessId are required');
    }

    const existing = await this.prisma.chatThread.findFirst({
      where: {
        creatorId,
        businessId,
        campaignId: dto.campaignId || null,
      },
      include: {
        creator: true,
        business: true,
        campaign: true,
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.chatThread.create({
      data: {
        creatorId,
        businessId,
        campaignId: dto.campaignId || null,
      },
      include: {
        creator: true,
        business: true,
        campaign: true,
      },
    });
  }

  async getMessages(userId: string, userRole: string, threadId: string, page = 1, limit = 50) {
    const thread = await this.prisma.chatThread.findUnique({
      where: { id: threadId },
      include: {
        creator: true,
        business: true,
      },
    });

    if (!thread) {
      throw new NotFoundException('Chat thread not found');
    }

    if (
      userRole !== UserRole.ADMIN &&
      thread.creator.userId !== userId &&
      thread.business.userId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const skip = (page - 1) * limit;

    const [total, messages] = await Promise.all([
      this.prisma.message.count({ where: { threadId, isDeleted: false } }),
      this.prisma.message.findMany({
        where: { threadId, isDeleted: false },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              role: true,
              creatorProfile: { select: { displayName: true, avatarUrl: true } },
              businessProfile: { select: { companyName: true, logoUrl: true } },
            },
          },
        },
      }),
    ]);

    return {
      data: messages.reverse(),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async sendMessage(userId: string, threadId: string, dto: SendMessageDto) {
    const thread = await this.prisma.chatThread.findUnique({
      where: { id: threadId },
      include: { creator: true, business: true },
    });

    if (!thread) {
      throw new NotFoundException('Chat thread not found');
    }

    if (thread.creator.userId !== userId && thread.business.userId !== userId) {
      throw new ForbiddenException('You cannot post in this chat thread');
    }

    // Scan for anti-disintermediation violations
    const scanResult = this.scanner.scan(dto.content);

    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          threadId,
          senderId: userId,
          content: dto.content,
          messageType: dto.messageType || 'text',
          mediaUrls: dto.mediaUrls || [],
          isFlagged: scanResult.isFlagged,
          flagReason: scanResult.flagReason,
        },
        include: {
          sender: {
            select: {
              id: true,
              role: true,
              creatorProfile: { select: { displayName: true, avatarUrl: true } },
              businessProfile: { select: { companyName: true, logoUrl: true } },
            },
          },
        },
      });

      if (scanResult.isFlagged) {
        await tx.chatThread.update({
          where: { id: threadId },
          data: {
            offPlatformContactDetected: true,
            warningCount: { increment: 1 },
            updatedAt: new Date(),
          },
        });
      } else {
        await tx.chatThread.update({
          where: { id: threadId },
          data: { updatedAt: new Date() },
        });
      }

      return msg;
    });

    return message;
  }

  async flagMessage(userId: string, messageId: string, reason?: string) {
    const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isFlagged: true,
        flagReason: reason || 'Flagged by user',
      },
    });
  }

  async reportThread(userId: string, threadId: string, dto: ReportThreadDto) {
    const thread = await this.prisma.chatThread.findUnique({ where: { id: threadId } });
    if (!thread) throw new NotFoundException('Chat thread not found');

    return this.prisma.report.create({
      data: {
        reporterId: userId,
        chatThreadId: threadId,
        reason: dto.reason,
        description: dto.description,
        status: 'PENDING',
      },
    });
  }
}
