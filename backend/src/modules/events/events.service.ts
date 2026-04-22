/* eslint-disable */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { ImportHistory } from './history.event.entity';
import { Registration } from '../registrations/registration.entity';
import { User } from '../users/user.entity';
import * as XLSX from 'xlsx';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private repo: Repository<Event>,
    @InjectRepository(ImportHistory)
    private importHistoryRepo: Repository<ImportHistory>,
    @InjectRepository(Registration)
    private registrationRepo: Repository<Registration>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  create(data: CreateEventDto) {
    const event = this.repo.create({
      title:           data.title,
      description:     data.description ?? data.title,
      startDate:       new Date(data.startDate),
      endDate:         data.endDate ? new Date(data.endDate) : new Date(data.startDate),
      location:        data.location,
      maxParticipants: data.maxParticipants ?? 200,
      status:          data.status ?? 'UPCOMING',
      imageUrl:        data.imageUrl,
      category:        data.category ?? 'NORMAL',
    });
    return this.repo.save(event);
  }

  findAll() {
    return this.repo.find({ order: { startDate: 'ASC' } });
  }

  async findOne(id: number) {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event id=${id} không tồn tại`);
    }
    return event;
  }

  async update(id: number, data: Partial<Event>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event id=${id} không tồn tại`);
    await this.repo.delete(id);
    return { message: 'Đã xóa sự kiện' };
  }

  // Import participants từ file Excel
  async importParticipants(eventId: number, fileBuffer: Buffer, importedBy: number, fileName: string) {
    const event = await this.findOne(eventId);

    let data: any[] = [];
    try {
      const workbook = XLSX.read(fileBuffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(sheet);
    } catch (error) {
      throw new BadRequestException('File Excel không đúng định dạng');
    }

    if (data.length === 0) {
      throw new BadRequestException('File không có dữ liệu');
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const email = row.email || row.Email;

      if (!email) {
        failedCount++;
        errors.push(`Dòng ${i + 2}: Thiếu email`);
        continue;
      }

      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        failedCount++;
        errors.push(`Dòng ${i + 2}: Email ${email} không tồn tại`);
        continue;
      }

      const existing = await this.registrationRepo.findOne({
        where: { userId: user.id, eventId },
      });
      if (existing) {
        failedCount++;
        errors.push(`Dòng ${i + 2}: ${email} đã đăng ký rồi`);
        continue;
      }

      const registration = this.registrationRepo.create({
        userId: user.id,
        eventId: eventId,
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
        checkedBy: importedBy,
      });

      await this.registrationRepo.save(registration);
      successCount++;
    }

    const importHistory = this.importHistoryRepo.create({
      eventId,
      importedBy,
      fileName,
      totalRows: data.length,
      successCount,
      failedCount,
      errors: errors.slice(0, 10).join('; '),
    });
    await this.importHistoryRepo.save(importHistory);

    return {
      message: `Import hoàn tất: ${successCount} thành công, ${failedCount} thất bại`,
      eventId,
      eventTitle: event.title,
      successCount,
      failedCount,
      errors: errors.slice(0, 20),
    };
  }

  async getImportHistory(eventId: number) {
    const history = await this.importHistoryRepo.find({
      where: { eventId },
      relations: ['user'],
      order: { importedAt: 'DESC' },
    });

    return history.map(h => ({
      id: h.id,
      fileName: h.fileName,
      importedBy: h.user?.username,
      importedAt: h.importedAt,
      totalRows: h.totalRows,
      successCount: h.successCount,
      failedCount: h.failedCount,
      errors: h.errors,
    }));
  }

  // Export danh sách participants ra Excel
  async exportParticipants(eventId: number) {
    const event = await this.findOne(eventId);

    const registrations = await this.registrationRepo.find({
      where: { eventId },
      relations: ['user'],
    });

    const data = registrations.map((reg, idx) => ({
      'STT':                idx + 1,
      'Họ tên':             reg.user?.username || 'N/A',
      'Email':              reg.user?.email    || 'N/A',
      'Trạng thái':         reg.status === 'CHECKED_IN' ? 'Đã tham gia' : 'Đã đăng ký',
      'Thời gian đăng ký':  reg.registeredAt,
      'Thời gian check-in': reg.checkedInAt   || 'Chưa check-in',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook  = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
