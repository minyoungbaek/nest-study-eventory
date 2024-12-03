import { ApiProperty } from '@nestjs/swagger';
import { EventData } from '../type/event-data.type';
import { IsOptional } from 'class-validator';

export class EventDto {
  @ApiProperty({
    description: '모임 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '호스트 ID',
    type: Number,
  })
  hostId!: number;

  @ApiProperty({
    description: '모임 이름',
    type: String,
  })
  title!: string;

  @ApiProperty({
    description: '모임 설명',
    type: String,
  })
  description!: string;

  @IsOptional()
  @ApiProperty({
    description: '클럽 ID',
    type: Number,
    nullable: true,
  })
  clubId!: number | null;

  @ApiProperty({
    description: '카테고리',
    type: Number,
  })
  categoryId!: number;

  @ApiProperty({
    description: '지역 목록',
    type: [Number],
  })
  cityIds!: number[];

  @ApiProperty({
    description: '모임 시작일',
    type: Date,
  })
  startTime!: Date;

  @ApiProperty({
    description: '모임 종료일',
    type: Date,
  })
  endTime!: Date;

  @ApiProperty({
    description: '모임 최대 정원',
    type: Number,
  })
  maxPeople!: number;

  static from(event: EventData): EventDto {
    return {
      id: event.id,
      hostId: event.hostId,
      title: event.title,
      description: event.description,
      clubId: event.clubId,
      categoryId: event.categoryId,
      cityIds: event.eventCity.map((city) => city.cityId),
      startTime: event.startTime,
      endTime: event.endTime,
      maxPeople: event.maxPeople,
    };
  }

  static fromArray(events: EventData[]): EventDto[] {
    return events.map((event) => this.from(event));
  }
}

export class EventListDto {
  @ApiProperty({
    description: '이벤트 목록',
    type: [EventDto],
  })
  events!: EventDto[];

  static from(events: EventData[]): EventListDto {
    return {
      events: EventDto.fromArray(events),
    };
  }
}
