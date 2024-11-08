import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { EventService } from './event.service';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateEventPayload } from './payload/create-event.payload';
import { EventQuery } from './query/event.query';
import { EventDto, EventListDto } from './dto/event.dto';

@Controller('events')
@ApiTags('Event API')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: '모임을 생성합니다' })
  @ApiCreatedResponse({ type: EventDto })
  async createEvent(@Body() payload: CreateEventPayload): Promise<EventDto> {
    return this.eventService.createEvent(payload);
  }

  @Get()
  @ApiOperation({ summary: '여러 모임 정보를 가져옵니다' })
  @ApiCreatedResponse({ type: EventListDto })
  async getEvent(@Query() query: EventQuery): Promise<EventListDto> {
    return this.eventService.getEvents(query);
  }
}
