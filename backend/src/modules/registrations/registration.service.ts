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
import { User } from '../users/user.entity';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Registration)
    private repo: Repository<Registration>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
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

    // Tạo registration TRƯỚC để có ID thật
    const registration = this.repo.create({
      userId,
      eventId,
      status: 'REGISTERED',
    });

    const savedRegistration = await this.repo.save(registration);

    // Tạo QR code với ID THẬT từ database
    const qrData = JSON.stringify({
      userId,
      eventId,
      registrationId: savedRegistration.id, // Dùng ID thật
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const qrCode = await toDataURL(qrData);

    // Cập nhật QR code vào registration
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    savedRegistration.qrCode = qrCode;
    return this.repo.save(savedRegistration);
  }

  async checkIn(
    eventId: number,
    qrData: string,
    checkedBy: number,
  ): Promise<Registration> {
    let userId: number;
    let registrationId: number;

    try {
      const parsed = JSON.parse(qrData) as {
        userId: number;
        registrationId: number;
      };
      userId = parsed.userId;
      registrationId = parsed.registrationId;
    } catch (error) {
      console.error('Invalid QR data:', error);
      throw new BadRequestException('QR code không hợp lệ');
    }

    console.log('Check-in info:', { registrationId, eventId, userId });

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

  async cancelRegistration(registrationId: number, userId: number) {
    const registration = await this.repo.findOne({
      where: { id: registrationId, userId },
      relations: ['event'],
    });

    if (!registration) throw new NotFoundException('Không tìm thấy đăng ký');

    const eventStartDate = new Date(registration.event.startDate);
    const now = new Date();

    if (now >= eventStartDate) {
      throw new BadRequestException('Không thể hủy sau khi sự kiện đã bắt đầu');
    }

    if (registration.status === 'CHECKED_IN') {
      throw new BadRequestException('Không thể hủy vì đã check-in');
    }

    registration.status = 'CANCELLED';
    return this.repo.save(registration);
  }

  async manualCheckIn(eventId: number, email: string, checkedBy: number) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Không tìm thấy sinh viên');

    const registration = await this.repo.findOne({
      where: { userId: user.id, eventId },
    });
    if (!registration) throw new NotFoundException('Sinh viên chưa đăng ký');
    if (registration.status === 'CHECKED_IN')
      throw new BadRequestException('Đã check-in rồi');

    registration.status = 'CHECKED_IN';
    registration.checkedInAt = new Date();
    registration.checkedBy = checkedBy;

    return this.repo.save(registration);
  }
}
