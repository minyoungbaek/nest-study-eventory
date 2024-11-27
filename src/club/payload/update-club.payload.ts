import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateClubPayload {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '클럽 이름',
    type: String,
  })
  name?: string | null;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '클럽 설명',
    type: String,
  })
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: '클럽 최대 정원',
    type: Number,
  })
  maxPeople?: number | null;
}
