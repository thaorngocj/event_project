import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  // Tất cả đều xem được event, kể cả khách chưa đăng nhập
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('HIT EVENT ID ROUTE', id);
    return this.eventsService.findOne(+id);
  }
  // chỉ rolesADMIN tạo event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  create(@Body() body: CreateEventDto) {
    return this.eventsService.create(body);
  }

  // chỉ rolesADMIN sửa event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateEventDto) {
    return this.eventsService.update(+id, body);
  }

  // chỉ rolesADMIN xóa event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}
