import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateFollowUpDto {
  @IsString()
  clientId;

  @IsDateString()
  dueDate;

  @IsOptional()
  @IsString()
  notes;
}
