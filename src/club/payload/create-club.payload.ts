import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class CreateClubPayload {
  @IsString()
  @ApiProperty({
    description: '클럽 이름',
    type: String,
  })
  name!: string;

  @IsString()
  @ApiProperty({
    description: '클럽 설명',
    type: String,
  })
  description!: string;

  @IsInt()
  @Min(1)
  @ApiProperty({
    description: '클럽 최대 정원',
    type: Number,
  })
  maxPeople!: number;
}
