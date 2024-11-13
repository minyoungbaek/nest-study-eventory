import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, IsDate, IsArray, Min } from 'class-validator';

export class CreateEventPayload {
  @IsInt()
  @ApiProperty({
    description: '호스트 ID',
    type: Number,
  })
  hostId!: number;

  @IsString()
  @ApiProperty({
    description: '모임 이름',
    type: String,
  })
  title!: string;

  @IsString()
  @ApiProperty({
    description: '모임 설명',
    type: String,
  })
  description!: string;

  @IsInt()
  @ApiProperty({
    description: '카테고리',
    type: Number,
  })
  categoryId!: number;

  @IsInt({ each: true })
  @IsArray()
  @ApiProperty({
    description: '지역 목록',
    type: [Number],
  })
  cityIds!: number[];

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: '모임 시작일',
    type: Date,
  })
  startTime!: Date;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: '모임 종료일',
    type: Date,
  })
  endTime!: Date;

  @IsInt()
  @Min(1)
  @ApiProperty({
    description: '모임 최대 정원',
    type: Number,
  })
  maxPeople!: number;
}
