import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';

@Entity()
export class Registration {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  // onDelete CASCADE: khi xóa event thì xóa luôn các registration liên quan
  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event!: Event;

  @Column()
  eventId!: number;

  @Column({ default: 'REGISTERED' })
  status!: 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED';

  @Column({ nullable: true, type: 'text' })
  qrCode!: string;

  @Column({ nullable: true })
  checkedInAt!: Date;

  @Column({ nullable: true })
  checkedBy!: number;

  @CreateDateColumn()
  registeredAt!: Date;
}
