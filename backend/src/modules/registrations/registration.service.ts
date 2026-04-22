import { toDataURL } from 'qrcode';
import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration } from './registration.entity';
import { Event } from '../events/event.entity';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Registration)
    private repo: Repository<Registration>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
  ) {}

  async register(userId: number, eventId: number) {
    // Kiểm tra event còn mở đăng ký
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event || event.status !== 'OPEN') {
      throw new BadRequestException('Sự kiện không mở đăng ký');
    }

    // Kiểm tra đã đăng ký chưa
    const existing = await this.repo.findOne({ where: { userId, eventId } });
    if (existing) throw new ConflictException('Đã đăng ký rồi');

    // Lưu registration trước để có id thực
    const registration = this.repo.create({
      userId,
      eventId,
      status: 'REGISTERED',
    });
    const saved = await this.repo.save(registration);

    // Tạo QR code với id thực của registration (không dùng Date.now())
    const qrData = JSON.stringify({
      registrationId: saved.id,
      userId,
      eventId,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const qrCode = await toDataURL(qrData);
    saved.qrCode = qrCode;

    return this.repo.save(saved);
  }

  async checkIn(
    eventId: number,
    qrData: string,
    checkedBy: number,
  ): Promise<Registration> {
    let registrationId: number;
    let userId: number;

    try {
      const parsed = JSON.parse(qrData) as {
        registrationId: number;
        userId: number;
      };
      registrationId = parsed.registrationId;
      userId = parsed.userId;
    } catch {
      throw new BadRequestException('QR data không hợp lệ');
    }

    const registration = await this.repo.findOne({
      where: {
        id: registrationId,
        eventId,
        userId,
      },
    });

    if (!registration) throw new NotFoundException('Đăng ký không hợp lệ');
    if (registration.status === 'CHECKED_IN')
      throw new BadRequestException('Đã check-in rồi');

    registration.status = 'CHECKED_IN';
    registration.checkedInAt = new Date();
    registration.checkedBy = checkedBy;

    return this.repo.save(registration);
  }

  async getUserRegistrations(userId: number) {
    const registrations = await this.repo.find({
      where: { userId },
      relations: ['event'],
      order: { registeredAt: 'DESC' },
    });

    return registrations.map((reg) => ({
      id: reg.id,
      eventId: reg.eventId,
      eventTitle: reg.event?.title,
      eventDate: reg.event?.startDate,
      status: reg.status,
      registeredAt: reg.registeredAt,
      checkedInAt: reg.checkedInAt,
      qrCode: reg.qrCode,
    }));
  }

  async getEventRegistrations(eventId: number) {
    const registrations = await this.repo.find({
      where: { eventId },
      relations: ['user'],
      order: { registeredAt: 'DESC' },
    });

    return registrations.map((reg) => ({
      id: reg.id,
      userId: reg.userId,
      username: reg.user?.username,
      email: reg.user?.email,
      status: reg.status,
      registeredAt: reg.registeredAt,
      checkedInAt: reg.checkedInAt,
    }));
  }
}
