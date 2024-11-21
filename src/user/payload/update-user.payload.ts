import { IsInt, IsOptional, IsString, IsEmail, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserPayload {
  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({
    description: '유저 이메일',
    type: String,
  })
  email?: string | null;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '유저 이름',
    type: String,
  })
  name?: string | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiPropertyOptional({
    description: '생일',
    type: Date,
  })
  birthday?: Date | null;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: '거주 지역',
    type: Number,
  })
  cityId?: number | null;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: '카테고리',
    type: Number,
  })
  categoryId?: number | null;
}
