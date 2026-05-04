import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsArray,
  IsEmail,
  MaxLength,
  Min,
} from 'class-validator';
import {
  DisplayCategory,
  EventCategory,
  Scale,
  EventStatus,
} from '../event.entity';

export class CreateEventDto {
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @MaxLength(500)
  location!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsEnum(DisplayCategory)
  displayCategory?: DisplayCategory;

  @IsOptional()
  @IsEnum(EventCategory)
  eventCategory?: EventCategory;

  @IsOptional()
  @IsEnum(Scale)
  scale?: Scale;

  @IsOptional()
  @IsString()
  faculty?: string;

  @IsOptional()
  @IsString()
  organizer?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxParticipants?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
