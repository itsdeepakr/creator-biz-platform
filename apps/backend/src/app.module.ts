import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaModule } from './common/prisma/prisma.module';
import { AppConfigModule } from './config/config.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CreatorsModule } from './modules/creators/creators.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { BidsModule } from './modules/bids/bids.module';
import { CollaborationsModule } from './modules/collaborations/collaborations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ChatModule } from './modules/chat/chat.module';
import { KycModule } from './modules/kyc/kyc.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    CreatorsModule,
    BusinessesModule,
    CampaignsModule,
    BidsModule,
    CollaborationsModule,
    PaymentsModule,
    ChatModule,
    KycModule,
    NotificationsModule,
    ReviewsModule,
    DisputesModule,
    AdminModule,
    HealthModule,
    FilesModule,
  ],
})
export class AppModule {}
