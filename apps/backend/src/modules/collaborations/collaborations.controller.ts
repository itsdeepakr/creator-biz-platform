import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CollaborationsService } from './collaborations.service';
import { SubmitDeliverableDto, RequestRevisionDto, CancelCollaborationDto } from './dto/submit-deliverable.dto';
import { CollaborationQueryDto } from './dto/collaboration-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('collaborations')
export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: CollaborationQueryDto,
  ) {
    return this.collaborationsService.findAll(user.id, user.role, query);
  }

  @Get(':id')
  async findById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.collaborationsService.findById(user.id, user.role, id);
  }

  @Post(':id/submit')
  @Roles(UserRole.CREATOR)
  async submitDeliverables(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: SubmitDeliverableDto,
  ) {
    return this.collaborationsService.submitDeliverables(user.id, id, dto);
  }

  @Post(':id/request-revision')
  @Roles(UserRole.BUSINESS, UserRole.ADMIN)
  async requestRevision(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: RequestRevisionDto,
  ) {
    return this.collaborationsService.requestRevision(user.id, user.role, id, dto);
  }

  @Post(':id/approve')
  @Roles(UserRole.BUSINESS, UserRole.ADMIN)
  async approveDeliverables(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ) {
    return this.collaborationsService.approveDeliverables(user.id, user.role, id);
  }

  @Post(':id/cancel')
  async cancelCollaboration(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CancelCollaborationDto,
  ) {
    return this.collaborationsService.cancelCollaboration(user.id, user.role, id, dto);
  }
}
