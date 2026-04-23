import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum DisplayCategory {
  HERO = 'HERO',
  FEATURED = 'FEATURED',
  HIGHLIGHT = 'HIGHLIGHT',
  NORMAL = 'NORMAL',
}

export enum EventCategory {
  ACADEMIC = 'ACADEMIC', // Học Thuật - Kỹ năng
  CULTURE = 'CULTURE', // Văn Hóa - Văn nghệ
  SPORT = 'SPORT', // Thể thao
  COMMUNITY = 'COMMUNITY', // Vì Cộng Đồng
  NATIONAL = 'NATIONAL', // Quốc lễ
  SCHOOL = 'SCHOOL', // Lễ hội trường
  SEMINAR = 'SEMINAR', // Diễn đàn - Hội thảo
}

export enum Scale {
  UNIT = 'UNIT', // cấp đơn vị
  SCHOOL = 'SCHOOL', // cấp trường - học viện
  CITY = 'CITY', // cấp thành
  NATIONAL = 'NATIONAL', // cấp quốc gia
}

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

  @Column({
    type: 'enum',
    enum: DisplayCategory,
    default: DisplayCategory.NORMAL,
  })
  displayCategory!: DisplayCategory;

  @Column({
    type: 'enum',
    enum: EventCategory,
    default: EventCategory.ACADEMIC,
  })
  eventCategory!: EventCategory;

  @Column({ type: 'enum', enum: Scale, default: Scale.SCHOOL })
  scale!: Scale;

  @Column({ nullable: true })
  faculty?: string;
}
