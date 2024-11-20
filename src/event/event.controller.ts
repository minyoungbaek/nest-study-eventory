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
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import {
  ApiBearerAuth,
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
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';

@Controller('events')
@ApiTags('Event API')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '새로운 모임을 추가합니다' })
  @ApiCreatedResponse({ type: EventDto })
  async createEvent(
    @Body() payload: CreateEventPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<EventDto> {
    return this.eventService.createEvent(payload, user);
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

  @Get(':me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내가 참여한 모임 정보를 가져옵니다' })
  @ApiOkResponse({ type: EventListDto })
  async getMyEvents(@CurrentUser() user: UserBaseInfo): Promise<EventListDto> {
    return this.eventService.getMyEvents(user);
  }

  @Post(':eventId/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저를 event에 참여시킵니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async joinEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.eventService.joinEvent(eventId, user);
  }

  @Post(':eventId/out')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '유저를 event에서 내보냅니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async outEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.eventService.outEvent(eventId, user);
  }

  @Patch(':eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '모임을 수정합니다' })
  @ApiOkResponse({ type: EventDto })
  async patchUpdateEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() payload: PatchUpdateEventPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<EventDto> {
    return this.eventService.patchUpdateEvent(eventId, payload, user);
  }

  @Delete(':eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: '모임을 삭제합니다' })
  @ApiNoContentResponse()
  async deleteEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.eventService.deleteEvent(eventId, user);
  }
}
