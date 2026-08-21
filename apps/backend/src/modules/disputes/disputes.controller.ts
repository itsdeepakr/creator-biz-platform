import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto, AddEvidenceDto, ResolveDisputeDto } from './dto/create-dispute.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { DisputeStatus, UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  async createDispute(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateDisputeDto,
  ) {
    return this.disputesService.createDispute(user.id, user.role, dto);
  }

  @Get()
  async getDisputes(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: DisputeStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.disputesService.getDisputes(
      user.id,
      user.role,
      status,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(':id')
  async getDisputeById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.disputesService.getDisputeById(user.id, user.role, id);
  }

  @Post(':id/evidence')
  async addEvidence(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: AddEvidenceDto,
  ) {
    return this.disputesService.addEvidence(user.id, user.role, id, dto);
  }

  @Post(':id/resolve')
  @Roles(UserRole.ADMIN)
  async resolveDispute(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolveDispute(user.id, id, dto);
  }
}
