import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Get,
} from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('registrations')
@ApiBearerAuth()
@Controller('registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  @Post('events/:eventId/register')
  @Roles('STUDENT')
  @ApiOperation({ summary: '[STUDENT] Đăng ký tham gia sự kiện' })
  async register(
    @Request() req: { user: { id: number } },
    @Param('eventId') eventId: string,
  ) {
    return await this.registrationService.register(req.user.id, +eventId);
  }

  @Post('events/:eventId/checkin')
  @Roles('EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '[ADMIN+] Check-in sinh viên bằng QR' })
  async checkIn(
    @Param('eventId') eventId: string,
    @Body('qrData') qrData: string,
    @Request() req: { user: { id: number } },
  ) {
    return await this.registrationService.checkIn(
      +eventId,
      qrData,
      req.user.id,
    );
  }

  @Get('my-events')
  @Roles('STUDENT', 'EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Xem danh sách sự kiện đã đăng ký' })
  async getMyEvents(@Request() req: { user: { id: number } }) {
    return await this.registrationService.getUserRegistrations(req.user.id);
  }

  @Get('events/:eventId/list')
  @Roles('EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '[ADMIN+] Danh sách đăng ký theo sự kiện' })
  async getEventRegistrations(@Param('eventId') eventId: string) {
    return await this.registrationService.getEventRegistrations(+eventId);
  }
}
