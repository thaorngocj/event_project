import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class StatisticsController {
  constructor(private statisticsService: StatisticsService) {}

  @Get('overview')
  async getOverview() {
    return this.statisticsService.getOverview();
  }

  @Get('events/:eventId')
  async getEventStats(@Param('eventId') eventId: string) {
    return this.statisticsService.getEventStats(+eventId);
  }

  @Get('students/top')
  async getTopStudents() {
    return this.statisticsService.getTopStudents();
  }
}
