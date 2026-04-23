import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsIn,
  IsNumber,
  IsString,
  IsEnum,
} from 'class-validator';
import { DisplayCategory, EventCategory, Scale } from '../event.entity';

export class CreateEventDto {
  @IsNotEmpty()
  title!: string;

  @IsNotEmpty()
  location!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsIn(['UPCOMING', 'OPEN', 'CLOSED'])
  status?: 'UPCOMING' | 'OPEN' | 'CLOSED';

  @IsOptional()
  @IsNumber()
  maxParticipants?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

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
}
