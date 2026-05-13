import {
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

// Value imports (runtime)
import {
  EVENT_STATUS,
  EVENT_CATEGORY,
  DISPLAY_CATEGORY,
  SCALE,
} from '../../../constants/event.constants';

// Type imports (compile-time)
import type {
  EventStatus,
  EventCategory,
  DisplayCategory,
  Scale,
} from '../../../constants/event.constants';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

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
