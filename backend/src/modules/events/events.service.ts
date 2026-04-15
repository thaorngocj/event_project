import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';

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
}
