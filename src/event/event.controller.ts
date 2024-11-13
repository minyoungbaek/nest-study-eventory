import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Get,
  Query,
  ParseIntPipe,
  Patch,
  HttpCode,
} from '@nestjs/common';
import { EventService } from './event.service';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEventPayload } from './payload/create-event.payload';
import { EventParticipantPayload } from './payload/create-eventjoin.payload';
import { EventQuery } from './query/event.query';
import { EventDto, EventListDto } from './dto/event.dto';
import { PatchUpdateEventPayload } from './payload/patch-update-event.payload';

@Controller('events')
@ApiTags('Event API')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: '새로운 모임을 추가합니다' })
  @ApiCreatedResponse({ type: EventDto })
  async createEvent(@Body() payload: CreateEventPayload): Promise<EventDto> {
    return this.eventService.createEvent(payload);
  }

  @Get(':eventId')
  @ApiOperation({ summary: '특정 id의 모임 데이터를 가져옵니다' })
  @ApiOkResponse({ type: EventDto })
  async getEventById(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<EventDto> {
    return this.eventService.getEventById(eventId);
  }

  @Get()
  @ApiOperation({ summary: '여러 모임 정보를 가져옵니다' })
  @ApiCreatedResponse({ type: EventListDto })
  async getEvent(@Query() query: EventQuery): Promise<EventListDto> {
    return this.eventService.getEvents(query);
  }

  @Post(':eventId/join')
  @ApiOperation({ summary: '유저를 event에 참여시킵니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async joinEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() payload: EventParticipantPayload,
  ): Promise<void> {
    return this.eventService.joinEvent(eventId, payload.userId);
  }

  @Post(':eventId/out')
  @ApiOperation({ summary: '유저를 event에서 내보냅니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async outEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() payload: EventParticipantPayload,
  ): Promise<void> {
    return this.eventService.outEvent(eventId, payload.userId);
  }

  @Patch(':eventId')
  @ApiOperation({ summary: '모임을 수정합니다' })
  @ApiOkResponse({ type: EventDto })
  async patchUpdateEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() payload: PatchUpdateEventPayload,
  ): Promise<EventDto> {
    return this.eventService.patchUpdateEvent(eventId, payload);
  }

  @Delete(':eventId')
  @HttpCode(204)
  @ApiOperation({ summary: '모임을 삭제합니다' })
  @ApiNoContentResponse()
  async deleteEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<void> {
    return this.eventService.deleteEvent(eventId);
  }
}
