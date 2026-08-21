import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableSoftDelete<T>(modelName: string) {
    return {
      [`findMany${modelName}`]: async (args: any) => {
        return (this as any)[modelName.toLowerCase()].findMany({
          ...args,
          where: { ...args.where, deletedAt: null },
        });
      },
    };
  }
}