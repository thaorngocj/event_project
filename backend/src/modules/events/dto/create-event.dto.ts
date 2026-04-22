import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsIn,
  IsNumber,
  IsString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Career Day 2026' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Mô tả sự kiện' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-05-01T08:00:00.000Z' })
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional({ example: '2026-05-01T17:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 'Toà J, CS3' })
  @IsNotEmpty()
  @IsString()
  location!: string;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  maxParticipants?: number;

  @ApiPropertyOptional({ enum: ['UPCOMING', 'OPEN', 'CLOSED'], default: 'UPCOMING' })
  @IsOptional()
  @IsIn(['UPCOMING', 'OPEN', 'CLOSED'])
  status?: 'UPCOMING' | 'OPEN' | 'CLOSED';

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ enum: ['HERO','FEATURED','HIGHLIGHT','NORMAL'], default: 'NORMAL' })
  @IsOptional()
  @IsIn(['HERO','FEATURED','HIGHLIGHT','NORMAL'])
  category?: 'HERO' | 'FEATURED' | 'HIGHLIGHT' | 'NORMAL';
}
