import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventRepository } from './event.repository';
import { CreateEventPayload } from './payload/create-event.payload';
import { EventDto, EventListDto } from './dto/event.dto';
import { EventQuery } from './query/event.query';
import { CreateEventData } from './type/create-event-data.type';
import { PatchUpdateEventPayload } from './payload/patch-update-event.payload';
import { UpdateEventData } from './type/update-event-data.type';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ClubRepository } from 'src/club/club.repository';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly clubRepository: ClubRepository,
  ) {}

  async createEvent(
    payload: CreateEventPayload,
    user: UserBaseInfo,
  ): Promise<EventDto> {
    const CategoryExist = await this.eventRepository.isCategoryExist(
      payload.categoryId,
    );
    if (!CategoryExist) {
      throw new NotFoundException('해당 카테고리가 존재하지 않습니다.');
    }

    if (payload.cityIds) {
      const validCityIds = await this.eventRepository.areCitiesExist(
        payload.cityIds,
      );
      if (!validCityIds) {
        throw new NotFoundException('존재하지 않는 지역이 포함되어 있습니다.');
      }
    }

    if (payload.startTime > payload.endTime) {
      throw new ConflictException(
        '시작 시간이 종료 시간보다 늦을 수 없습니다.',
      );
    }

    if (payload.startTime < new Date()) {
      throw new ConflictException(
        '이미 지난 시간에 대한 모임은 생성할 수 없습니다.',
      );
    }

    if (payload.clubId) {
      const clubValidity = await this.clubRepository.getClubById(
        payload.clubId,
      );
      if (!clubValidity) {
        throw new NotFoundException('해당 클럽이 존재하지 않습니다.');
      }

      const userJoinedClub = await this.clubRepository.isUserJoinedClub(
        user.id,
        payload.clubId,
      );
      if (!userJoinedClub) {
        throw new ForbiddenException(
          '클럽 모임은 클럽원만 개설할 수 있습니다.',
        );
      }
    }

    const createData: CreateEventData = {
      hostId: user.id,
      title: payload.title,
      description: payload.description,
      clubId: payload.clubId,
      categoryId: payload.categoryId,
      cityIds: payload.cityIds,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };

    const event = await this.eventRepository.createEvent(createData);

    return EventDto.from(event);
  }

  async getEventById(eventId: number): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventId);

    if (!event) {
      throw new NotFoundException('모임이 존재하지 않습니다.');
    }

    return EventDto.from(event);
  }

  async getEvents(query: EventQuery): Promise<EventListDto> {
    const events = await this.eventRepository.getEvents(query);

    return EventListDto.from(events);
  }

  async getMyEvents(user: UserBaseInfo): Promise<EventListDto> {
    const events = await this.eventRepository.getMyEvents(user.id);

    return EventListDto.from(events);
  }

  async joinEvent(eventId: number, user: UserBaseInfo): Promise<void> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('모임이 존재하지 않습니다.');
    }

    const userJoinedEvent = await this.eventRepository.isUserJoinedEvent(
      user.id,
      eventId,
    );
    if (userJoinedEvent) {
      throw new ConflictException('이미 참가한 모임입니다.');
    }

    if (event.endTime < new Date()) {
      throw new ConflictException('이미 종료된 모임에는 참가할 수 없습니다.');
    }

    if (event.clubId != null) {
      const userJoinedClub = await this.clubRepository.isUserJoinedClub(
        user.id,
        event.clubId,
      );
      if (!userJoinedClub) {
        throw new ForbiddenException('클럽원만 참가할 수 있는 모임입니다.');
      }
    }

    const currentParticipantCount =
      await this.eventRepository.getEventParticipantCount(eventId);

    if (event.maxPeople == currentParticipantCount) {
      throw new ConflictException('이미 정원이 다 찼습니다.');
    }

    await this.eventRepository.joinEvent(user.id, eventId);
  }

  async outEvent(eventId: number, user: UserBaseInfo): Promise<void> {
    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('모임이 존재하지 않습니다.');
    }

    const userJoinedEvent = await this.eventRepository.isUserJoinedEvent(
      user.id,
      eventId,
    );
    if (!userJoinedEvent) {
      throw new ConflictException('참가하지 않은 모임입니다.');
    }

    if (event.endTime < new Date()) {
      throw new ConflictException('이미 종료된 모임에서는 나갈 수 없습니다.');
    }

    if (event.hostId == user.id) {
      throw new ConflictException('호스트는 모임에서 나갈 수 없습니다.');
    }

    await this.eventRepository.outEvent(user.id, eventId);
  }

  async patchUpdateEvent(
    eventId: number,
    payload: PatchUpdateEventPayload,
    user: UserBaseInfo,
  ): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventId);

    if (!event) {
      throw new NotFoundException('모임이 존재하지 않습니다.');
    }

    if (event.hostId !== user.id) {
      throw new ForbiddenException('모임은 호스트만 수정이 가능합니다.');
    }

    if (payload.title === null) {
      throw new BadRequestException('모임 이름은 null이 될 수 없습니다.');
    }
    if (payload.description === null) {
      throw new BadRequestException('모임 설명은 null이 될 수 없습니다.');
    }
    if (payload.categoryId === null) {
      throw new BadRequestException('카테고리는 null이 될 수 없습니다.');
    }
    if (payload.cityIds === null) {
      throw new BadRequestException('지역은 null이 될 수 없습니다.');
    }
    if (payload.startTime === null) {
      throw new BadRequestException('시작일은 null이 될 수 없습니다.');
    }
    if (payload.endTime === null) {
      throw new BadRequestException('종료일은 null이 될 수 없습니다.');
    }
    if (payload.maxPeople === null) {
      throw new BadRequestException('최대 정원은 null이 될 수 없습니다.');
    }

    //시작전까지만 수정 가능
    if (event.startTime < new Date()) {
      throw new ConflictException('이미 시작된 모임은 수정할 수 없습니다.');
    }

    //category 존재 여부
    if (payload.categoryId != undefined) {
      if (payload.categoryId == 0) {
        throw new NotFoundException('해당 카테고리가 존재하지 않습니다.');
      }

      const CategoryExist = await this.eventRepository.isCategoryExist(
        payload.categoryId,
      );
      if (!CategoryExist) {
        throw new NotFoundException('해당 카테고리가 존재하지 않습니다.');
      }
    }
    //city 존재 여부
    if (payload.cityIds) {
      const validCityIds = await this.eventRepository.areCitiesExist(
        payload.cityIds,
      );
      if (!validCityIds) {
        throw new NotFoundException('존재하지 않는 지역이 포함되어 있습니다.');
      }
    }

    const startTime = payload.startTime ?? event.startTime;
    const endTime = payload.endTime ?? event.endTime;

    if (startTime > endTime) {
      throw new ConflictException('시작 시간은 종료 시간보다 앞서야 합니다.');
    }

    if (startTime < new Date()) {
      throw new ConflictException('시작 시간은 현재 시간 이후여야 합니다.');
    }

    //정원 < 참가자 수
    const currentParticipantCount =
      await this.eventRepository.getEventParticipantCount(eventId);

    if (payload.maxPeople && payload.maxPeople < currentParticipantCount) {
      throw new ConflictException(
        '정원을 참가자 수보다 적게 수정할 수 없습니다.',
      );
    }

    const updateData: UpdateEventData = {
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityIds: payload.cityIds,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };

    const updatedEvent = await this.eventRepository.updateEvent(
      eventId,
      updateData,
    );

    return EventDto.from(updatedEvent);
  }

  async deleteEvent(eventId: number, user: UserBaseInfo): Promise<void> {
    const event = await this.eventRepository.getEventById(eventId);

    if (!event) {
      throw new NotFoundException('모임이 존재하지 않습니다.');
    }

    if (event.hostId !== user.id) {
      throw new ForbiddenException('모임은 호스트만 삭제가 가능합니다.');
    }

    //시작전까지만 삭제 가능
    if (event.startTime < new Date()) {
      throw new ConflictException('이미 시작된 모임은 삭제할 수 없습니다.');
    }

    await this.eventRepository.deleteEvent(eventId);
  }
}
