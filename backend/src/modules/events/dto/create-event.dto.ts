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
  EVENT_STATUS,
  EVENT_CATEGORY,
  DISPLAY_CATEGORY,
  SCALE,
} from '../../../constants/event.constants';
import type {
  EventStatus,
  EventCategory,
  DisplayCategory,
  Scale,
} from '../../../constants/event.constants';

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
  @IsEnum(EVENT_STATUS)
  status?: EventStatus;

  @IsOptional()
  @IsEnum(DISPLAY_CATEGORY)
  displayCategory?: DisplayCategory;

  @IsOptional()
  @IsEnum(EVENT_CATEGORY)
  eventCategory?: EventCategory;

  @IsOptional()
  @IsEnum(SCALE)
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
