import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsIn,
  IsNumber,
} from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  title!: string;

  @IsNotEmpty()
  location!: string;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  endTime!: string;

  @IsOptional()
  @IsIn(['UPCOMING', 'OPEN', 'CLOSED'])
  status?: 'UPCOMING' | 'OPEN' | 'CLOSED';

  @IsOptional()
  @IsNumber()
  maxParticipants?: number;
}
