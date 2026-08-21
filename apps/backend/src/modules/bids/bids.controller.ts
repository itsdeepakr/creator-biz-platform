import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BidsService } from './bids.service';
import { CreateBidDto, CounterOfferDto } from './dto/create-bid.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post('campaigns/:campaignId/bids')
  @Roles(UserRole.CREATOR)
  async createBid(
    @CurrentUser() user: AuthUser,
    @Param('campaignId') campaignId: string,
    @Body() dto: CreateBidDto,
  ) {
    return this.bidsService.createBid(user.id, campaignId, dto);
  }

  @Get('campaigns/:campaignId/bids')
  async getBidsForCampaign(
    @CurrentUser() user: AuthUser,
    @Param('campaignId') campaignId: string,
  ) {
    return this.bidsService.getBidsForCampaign(user.id, user.role, campaignId);
  }

  @Get('bids/:id')
  async getBidById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.bidsService.getBidById(user.id, user.role, id);
  }

  @Post('bids/:id/counter')
  async counterOffer(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CounterOfferDto,
  ) {
    return this.bidsService.counterOffer(user.id, user.role, id, dto);
  }

  @Post('bids/:id/accept')
  async acceptBid(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.bidsService.acceptBid(user.id, user.role, id);
  }

  @Post('bids/:id/reject')
  async rejectBid(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.bidsService.rejectBid(user.id, user.role, id);
  }

  @Post('bids/:id/withdraw')
  @Roles(UserRole.CREATOR, UserRole.ADMIN)
  async withdrawBid(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.bidsService.withdrawBid(user.id, user.role, id);
  }
}
