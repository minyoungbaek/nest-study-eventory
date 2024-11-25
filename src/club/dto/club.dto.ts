import { ApiProperty } from '@nestjs/swagger';
import { ClubData } from '../type/club-data.type';

export class ClubDto {
  @ApiProperty({
    description: '클럽 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '클럽 이름',
    type: String,
  })
  name!: string;

  @ApiProperty({
    description: '클럽 설명',
    type: String,
  })
  description!: string;

  @ApiProperty({
    description: '클럽장 ID',
    type: Number,
  })
  leaderId!: number;

  @ApiProperty({
    description: '클럽 최대 정원',
    type: Number,
  })
  maxPeople!: number;

  static from(club: ClubData): ClubDto {
    return {
      id: club.id,
      name: club.name,
      description: club.description,
      leaderId: club.leaderId,
      maxPeople: club.maxPeople,
    };
  }

  static fromArray(clubs: ClubData[]): ClubDto[] {
    return clubs.map((club) => ClubDto.from(club));
  }
}

export class ClubListDto {
  @ApiProperty({
    description: '클럽 목록',
    type: [ClubDto],
  })
  clubs!: ClubDto[];

  static from(clubs: ClubData[]): ClubListDto {
    return {
      clubs: ClubDto.fromArray(clubs),
    };
  }
}
