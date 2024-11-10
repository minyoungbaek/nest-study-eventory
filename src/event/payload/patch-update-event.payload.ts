import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class PatchUpdateEventPayload {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '모임 이름',
    type: String,
  })
  title?: string | null;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '모임 설명',
    type: String,
  })
  description?: string | null;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: '카테고리',
    type: Number,
  })
  categoryId?: number | null;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: '지역',
    type: Number,
  })
  cityId?: number | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiPropertyOptional({
    description: '모임 시작일',
    type: Date,
  })
  startTime?: Date | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiPropertyOptional({
    description: '모임 종료일',
    type: Date,
  })
  endTime?: Date | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: '모임 최대 정원',
    type: Number,
  })
  maxPeople?: number | null;
}
