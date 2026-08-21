import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  CreateEscrowOrderDto,
  VerifyEscrowPaymentDto,
  ReleasePayoutDto,
  RefundSplitDto,
} from './dto/create-escrow-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('escrow/create-order')
  @Roles(UserRole.BUSINESS)
  async createEscrowOrder(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateEscrowOrderDto,
  ) {
    return this.paymentsService.createEscrowOrder(user.id, dto);
  }

  @Post('escrow/verify')
  @Roles(UserRole.BUSINESS)
  async verifyEscrowPayment(
    @CurrentUser() user: AuthUser,
    @Body() dto: VerifyEscrowPaymentDto,
  ) {
    return this.paymentsService.verifyEscrowPayment(user.id, dto);
  }

  @Post('release')
  @Roles(UserRole.BUSINESS, UserRole.ADMIN)
  async releasePayout(
    @CurrentUser() user: AuthUser,
    @Body() dto: ReleasePayoutDto,
  ) {
    return this.paymentsService.releasePayout(user.id, user.role, dto);
  }

  @Post('refund-split')
  @Roles(UserRole.ADMIN)
  async refundSplit(
    @CurrentUser() user: AuthUser,
    @Body() dto: RefundSplitDto,
  ) {
    return this.paymentsService.refundSplit(user.id, user.role, dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('webhook')
  async handleWebhook(
    @Body() body: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(body, signature);
  }

  @Get('history')
  async getPaymentHistory(@CurrentUser() user: AuthUser) {
    return this.paymentsService.getPaymentHistory(user.id, user.role);
  }

  @Get('collaboration/:collaborationId')
  async getCollaborationPayment(
    @CurrentUser() user: AuthUser,
    @Param('collaborationId') collaborationId: string,
  ) {
    return this.paymentsService.getCollaborationPayment(user.id, user.role, collaborationId);
  }
}
