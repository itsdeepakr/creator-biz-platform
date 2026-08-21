import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { BusinessQueryDto } from './dto/business-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Public()
  @Get()
  async findAll(@Query() query: BusinessQueryDto) {
    return this.businessesService.findAll(query);
  }

  @Get('me/profile')
  @Roles(UserRole.BUSINESS)
  async getMyProfile(@CurrentUser() user: AuthUser) {
    return this.businessesService.findByUserId(user.id);
  }

  @Patch('me/profile')
  @Roles(UserRole.BUSINESS)
  async updateMyProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateBusinessProfileDto,
  ) {
    return this.businessesService.updateProfile(user.id, dto);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.businessesService.findById(id);
  }
}
