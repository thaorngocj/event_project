import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

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
  UNIT = 'UNIT',
  SCHOOL = 'SCHOOL',
  CITY = 'CITY',
  NATIONAL = 'NATIONAL',
}

export enum EventStatus {
  DRAFT = 'DRAFT', // Nháp, chưa public
  UPCOMING = 'UPCOMING', // Sắp diễn ra
  OPEN = 'OPEN', // Đang mở đăng ký
  ONGOING = 'ONGOING', // Đang diễn ra
  CLOSED = 'CLOSED', // Đã kết thúc
  CANCELLED = 'CANCELLED', // Bị hủy
}

@Entity('events')
@Index(['startDate', 'endDate']) // index cho calendar query
@Index(['eventCategory']) // index cho filter
@Index(['status']) // index cho cron update
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  // ── Thông tin cơ bản ──────────────────────────────────────────

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 500 })
  location!: string;

  // ── Thời gian ──────────────────────────────────────────────────

  @Column({ type: 'timestamptz' }) // timestamptz = có timezone
  startDate!: Date;

  @Column({ type: 'timestamptz' })
  endDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  registrationDeadline?: Date | null; // Hạn đăng ký (≤ startDate)

  // ── Trạng thái ─────────────────────────────────────────────────

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.UPCOMING,
  })
  status!: EventStatus;

  @Column({ default: false })
  isCancelled!: boolean; // Soft cancel, giữ data

  // ── Phân loại ──────────────────────────────────────────────────

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

  // ── Đơn vị tổ chức ─────────────────────────────────────────────

  @Column({ length: 255, nullable: true })
  faculty?: string; // Khoa tổ chức

  @Column({ length: 255, nullable: true })
  organizer?: string; // Tên đơn vị/CLB/Đoàn-Hội

  @Column({ length: 100, nullable: true })
  contactEmail?: string;

  @Column({ length: 20, nullable: true })
  contactPhone?: string;

  // ── Người tham dự ──────────────────────────────────────────────

  @Column({ type: 'int', nullable: true })
  maxParticipants?: number; // null = không giới hạn

  @Column({ type: 'int', default: 0 })
  registeredCount!: number; // Cache count, sync qua trigger/service

  // ── Media ───────────────────────────────────────────────────────

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  bannerUrl?: string; // Ảnh banner lớn cho HERO

  // ── Tags & SEO ──────────────────────────────────────────────────

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[]; // ['BMC', 'khởi nghiệp', 'sinh viên']

  // ── Audit ───────────────────────────────────────────────────────

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ type: 'int', nullable: true })
  createdBy?: number; // userId của admin tạo event

  // ── Computed helper (không lưu DB) ──────────────────────────────

  get isRegistrationOpen(): boolean {
    const now = new Date();
    const deadline = this.registrationDeadline ?? this.startDate;
    return (
      this.status === EventStatus.UPCOMING &&
      !this.isCancelled &&
      now < deadline &&
      (this.maxParticipants == null ||
        this.registeredCount < this.maxParticipants)
    );
  }

  get isFull(): boolean {
    return (
      this.maxParticipants != null &&
      this.registeredCount >= this.maxParticipants
    );
  }
}
