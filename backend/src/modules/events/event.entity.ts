import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @Column()
  location!: string;

  @Column({ nullable: true })
  maxParticipants!: number;

  @Column({ default: 'UPCOMING' })
  status!: 'UPCOMING' | 'OPEN' | 'CLOSED';

  @Column({ nullable: true, type: 'text' })
  imageUrl?: string;

  // HERO=hiện trên carousel, FEATURED=sự kiện đề xuất, HIGHLIGHT=sự kiện nổi bật, NORMAL=thường
  @Column({ default: 'NORMAL' })
  category!: 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL';
}
