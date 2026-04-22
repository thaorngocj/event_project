import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/event.entity';
import { Registration } from '../registrations/registration.entity';
import { User } from '../users/user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(Registration)
    private registrationRepo: Repository<Registration>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getOverview() {
    const totalEvents        = await this.eventRepo.count();
    const totalStudents      = await this.userRepo.count({ where: { role: 'STUDENT' } });
    const totalRegistrations = await this.registrationRepo.count();
    const totalCheckins      = await this.registrationRepo.count({ where: { status: 'CHECKED_IN' } });

    return {
      totalEvents,
      totalStudents,
      totalRegistrations,
      totalCheckins,
      checkinRate: totalRegistrations > 0
        ? +((totalCheckins / totalRegistrations) * 100).toFixed(2)
        : 0,
    };
  }

  async getEventStats(eventId: number) {
    const event         = await this.eventRepo.findOne({ where: { id: eventId } });
    const registrations = await this.registrationRepo.find({ where: { eventId } });
    const checkedIn     = registrations.filter(r => r.status === 'CHECKED_IN').length;

    return {
      event:           event?.title,
      totalRegistered: registrations.length,
      checkedIn,
      notCheckedIn:    registrations.length - checkedIn,
      checkinRate:     registrations.length > 0
        ? +((checkedIn / registrations.length) * 100).toFixed(2)
        : 0,
    };
  }

  async getTopStudents(limit = 10) {
    // Fix: join user table, cast COUNT to int, use FILTER instead of CASE WHEN
    const rows = await this.registrationRepo
      .createQueryBuilder('r')
      .innerJoin('r.user', 'u')
      .select('r.userId',     'userId')
      .addSelect('u.username','username')
      .addSelect('u.email',   'email')
      .addSelect('COUNT(r.id)::int', 'eventCount')
      .addSelect(
        `COUNT(r.id) FILTER (WHERE r.status = 'CHECKED_IN')::int`,
        'checkedCount',
      )
      .groupBy('r.userId')
      .addGroupBy('u.username')
      .addGroupBy('u.email')
      .orderBy('"eventCount"', 'DESC')
      .limit(limit)
      .getRawMany<{
        userId: number;
        username: string;
        email: string;
        eventCount: number;
        checkedCount: number;
      }>();

    return rows;
  }
}
