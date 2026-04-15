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
    console.log('Register service - userId:', userId, 'eventId:', eventId);
    // Kiểm tra event còn mở đăng ký
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event || event.status !== 'OPEN') {
      throw new BadRequestException('Sự kiện không mở đăng ký');
    }

    // Kiểm tra đã đăng ký chưa
    const existing = await this.repo.findOne({ where: { userId, eventId } });
    if (existing) throw new ConflictException('Đã đăng ký rồi');

    // Tạo QR code
    const qrData = JSON.stringify({
      userId,
      eventId,
      registrationId: Date.now(),
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const qrCode = await toDataURL(qrData);

    const registration = this.repo.create({
      userId,
      eventId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      qrCode,
      status: 'REGISTERED',
    });

    return this.repo.save(registration);
  }

  async checkIn(
    eventId: number,
    qrData: string,
    checkedBy: number,
  ): Promise<Registration> {
    const parsed = JSON.parse(qrData) as {
      userId: number;
      registrationId: number;
    };
    const { userId, registrationId } = parsed;

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

  // THÊM METHOD NÀY
  async getUserRegistrations(userId: number) {
    const registrations = await this.repo.find({
      where: { userId },
      relations: ['event'], // Lấy thông tin event
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
}
