import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { UpdateCreatorProfileDto } from './dto/update-creator-profile.dto';
import { CreatorQueryDto } from './dto/creator-query.dto';
import { CreateServiceDto, UpdateServiceDto } from './dto/create-service.dto';
import { CreatePortfolioItemDto, UpdatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { ConnectSocialDto } from './dto/connect-social.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('creators')
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: CreatorQueryDto) {
    return this.creatorsService.findAll(query);
  }

  @Get('me/profile')
  @Roles(UserRole.CREATOR)
  async getMyProfile(@CurrentUser() user: AuthUser) {
    return this.creatorsService.findByUserId(user.id);
  }

  @Patch('me/profile')
  @Roles(UserRole.CREATOR)
  async updateMyProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateCreatorProfileDto,
  ) {
    return this.creatorsService.updateProfile(user.id, dto);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.creatorsService.findById(id);
  }

  // Services
  @Post('me/services')
  @Roles(UserRole.CREATOR)
  async createService(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateServiceDto,
  ) {
    return this.creatorsService.createService(user.id, dto);
  }

  @Patch('me/services/:id')
  @Roles(UserRole.CREATOR)
  async updateService(
    @CurrentUser() user: AuthUser,
    @Param('id') serviceId: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.creatorsService.updateService(user.id, serviceId, dto);
  }

  @Delete('me/services/:id')
  @Roles(UserRole.CREATOR)
  async deleteService(
    @CurrentUser() user: AuthUser,
    @Param('id') serviceId: string,
  ) {
    return this.creatorsService.deleteService(user.id, serviceId);
  }

  // Portfolio
  @Post('me/portfolio')
  @Roles(UserRole.CREATOR)
  async createPortfolioItem(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePortfolioItemDto,
  ) {
    return this.creatorsService.createPortfolioItem(user.id, dto);
  }

  @Patch('me/portfolio/:id')
  @Roles(UserRole.CREATOR)
  async updatePortfolioItem(
    @CurrentUser() user: AuthUser,
    @Param('id') itemId: string,
    @Body() dto: UpdatePortfolioItemDto,
  ) {
    return this.creatorsService.updatePortfolioItem(user.id, itemId, dto);
  }

  @Delete('me/portfolio/:id')
  @Roles(UserRole.CREATOR)
  async deletePortfolioItem(
    @CurrentUser() user: AuthUser,
    @Param('id') itemId: string,
  ) {
    return this.creatorsService.deletePortfolioItem(user.id, itemId);
  }

  // Social
  @Post('me/social')
  @Roles(UserRole.CREATOR)
  async connectSocial(
    @CurrentUser() user: AuthUser,
    @Body() dto: ConnectSocialDto,
  ) {
    return this.creatorsService.connectSocial(user.id, dto);
  }

  @Get('me/social')
  @Roles(UserRole.CREATOR)
  async getMySocial(@CurrentUser() user: AuthUser) {
    return this.creatorsService.getSocialConnections(user.id);
  }
}
