/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import * as XLSX from 'xlsx';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private repo: Repository<Event>,
  ) {}

  create(data: Partial<Event>) {
    const event = this.repo.create(data);
    return this.repo.save(event);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(id: number, data: Partial<Event>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { message: 'Deleted' };
  }

  // Thêm method import
  async importParticipants(eventId: number, fileBuffer: Buffer) {
    // Kiểm tra event tồn tại
    const event = await this.findOne(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Đọc file Excel
    const workbook = XLSX.read(fileBuffer);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    // TODO: Xử lý import vào registration table
    // Tạm thời trả về danh sách đọc được
    return {
      message: `Imported ${data.length} participants`,
      eventId: eventId,
      eventTitle: event.title,
      data: data,
    };
  }

  // Export method
  async exportParticipants(eventId: number) {
    const event = await this.findOne(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // TODO: Lấy danh sách participants từ registration table
    // Tạm thời tạo data mẫu
    const participants = [
      { name: 'Student 1', email: 'sv01@school.edu', status: 'CHECKED_IN' },
      { name: 'Student 2', email: 'sv02@school.edu', status: 'REGISTERED' },
    ];

    // Tạo Excel
    const worksheet = XLSX.utils.json_to_sheet(participants);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  }
}
