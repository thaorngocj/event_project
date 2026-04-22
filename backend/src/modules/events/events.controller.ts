import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả sự kiện' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết sự kiện' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: '[ADMIN+] Tạo sự kiện mới' })
  create(@Body() body: CreateEventDto) {
    return this.eventsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: '[ADMIN+] Cập nhật sự kiện' })
  update(@Param('id') id: string, @Body() body: UpdateEventDto) {
    // Convert string dates to Date objects if present
    const updateData: Partial<InstanceType<typeof import('./event.entity').Event>> = { ...body } as any;
    if (body.startDate) (updateData as any).startDate = new Date(body.startDate);
    if (body.endDate)   (updateData as any).endDate   = new Date(body.endDate);
    return this.eventsService.update(+id, updateData as any);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: '[ADMIN+] Xóa sự kiện' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

  @Post(':id/import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN+] Import danh sách tham gia từ Excel' })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async importParticipants(
    @Param('id') id: string,
    @UploadedFile() file: { buffer: Buffer; originalname: string },
    @Request() req: { user: { id: number } },
  ) {
    if (!file) throw new Error('Không có file được upload');
    return await this.eventsService.importParticipants(
      +id,
      file.buffer,
      req.user.id,
      file.originalname,
    );
  }

  @Get(':id/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN+] Xuất danh sách tham gia ra Excel' })
  async exportParticipants(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.eventsService.exportParticipants(+id);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="event_${id}_participants.xlsx"`,
    });
    res.send(buffer);
  }

  @Get(':id/import-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[ADMIN+] Lịch sử import' })
  async getImportHistory(@Param('id') id: string) {
    return await this.eventsService.getImportHistory(+id);
  }
}
