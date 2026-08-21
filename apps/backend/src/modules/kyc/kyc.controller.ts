import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { SubmitKycDto, ReviewKycDto } from './dto/submit-kyc.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('kyc/submit')
  @Roles(UserRole.CREATOR, UserRole.BUSINESS)
  async submitKyc(
    @CurrentUser() user: AuthUser,
    @Body() dto: SubmitKycDto,
  ) {
    return this.kycService.submitKyc(user.id, user.role, dto);
  }

  @Get('kyc/status')
  async getKycStatus(@CurrentUser() user: AuthUser) {
    return this.kycService.getKycStatus(user.id, user.role);
  }

  @Get('admin/kyc/pending')
  @Roles(UserRole.ADMIN)
  async getPendingKycSubmissions() {
    return this.kycService.getPendingKycSubmissions();
  }

  @Post('admin/kyc/:id/review')
  @Roles(UserRole.ADMIN)
  async reviewKyc(
    @Param('id') id: string,
    @Body() dto: ReviewKycDto,
  ) {
    return this.kycService.reviewKyc(id, dto);
  }
}
