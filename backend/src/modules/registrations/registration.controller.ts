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

@Controller('registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrationController {
  constructor(private registrationService: RegistrationService) {}

  @Post('events/:eventId/register')
  @Roles('STUDENT')
  async register(
    @Request() req: { user: { id: number } },
    @Param('eventId') eventId: string,
  ) {
    console.log('Request user:', req.user);
    const userId = req.user.id;
    console.log('User ID:', userId);
    console.log('Event ID:', eventId);
    return await this.registrationService.register(req.user.id, +eventId);
  }

  @Post('events/:eventId/checkin')
  @Roles('EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN')
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
  @Roles('STUDENT')
  async getMyEvents(@Request() req: { user: { id: number } }) {
    return await this.registrationService.getUserRegistrations(req.user.id);
  }
}
