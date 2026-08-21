import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ModerateCampaignDto, ModerateUserDto } from './dto/moderate-campaign.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('analytics/kpi')
  async getKpiAnalytics() {
    return this.adminService.getKpiAnalytics();
  }

  @Get('analytics/revenue')
  async getRevenueAnalytics() {
    return this.adminService.getRevenueAnalytics();
  }

  @Get('transactions')
  async getTransactions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getTransactions(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Patch('campaigns/:id/moderate')
  async moderateCampaign(
    @Param('id') id: string,
    @Body() dto: ModerateCampaignDto,
  ) {
    return this.adminService.moderateCampaign(id, dto);
  }

  @Patch('users/:id/moderate')
  async moderateUser(
    @Param('id') id: string,
    @Body() dto: ModerateUserDto,
  ) {
    return this.adminService.moderateUser(id, dto);
  }
}
