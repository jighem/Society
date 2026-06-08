import { Controller, Get, Param, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obtain authenticated user profile from active JWT payload' })
  @ApiResponse({ status: 200, description: 'Profile returned successfully.' })
  async getProfile(@Req() req: any) {
    const profile = await this.usersService.getProfile(req.user.id);
    return {
      success: true,
      message: 'Profile fetched successfully',
      data: profile,
      errors: null,
    };
  }

  @Get()
  @RequirePermissions('settings.manage')
  @ApiOperation({ summary: 'Retrieve list of all users (SOCIETY_ADMIN / SUPER_ADMIN only)' })
  async findAll(@Req() req: any) {
    const users = await this.usersService.findAll(req.user.societyId);
    return {
      success: true,
      message: 'Users fetched successfully',
      data: users,
      errors: null,
    };
  }

  @Patch(':id/status')
  @RequirePermissions('settings.manage')
  @ApiOperation({ summary: 'Activate/Deactivate user access accounts' })
  async setStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    const updated = await this.usersService.setStatus(id, isActive);
    return {
      success: true,
      message: 'User status successfully updated',
      data: updated,
      errors: null,
    };
  }
}
