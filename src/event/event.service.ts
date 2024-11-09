import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventRepository } from './event.repository';
import { CreateEventPayload } from './payload/create-event.payload';
import { EventDto, EventListDto } from './dto/event.dto';
import { EventQuery } from './query/event.query';
import { CreateEventData } from './type/create-event-data.type';

@Injectable()
export class EventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async createEvent(payload: CreateEventPayload): Promise<EventDto> {
    const createData: CreateEventData = {
      hostId: payload.hostId,
      title: payload.title,
      description: payload.description,
      categoryId: payload.categoryId,
      cityId: payload.cityId,
      startTime: payload.startTime,
      endTime: payload.endTime,
      maxPeople: payload.maxPeople,
    };

    const HostExist = await this.eventRepository.isUserExist(payload.hostId);
    if (!HostExist) {
      throw new ConflictException('해당 유저가 존재하지 않습니다.');
    }

    const CategoryExist = await this.eventRepository.isCategoryExist(
      payload.categoryId,
    );
    if (!CategoryExist) {
      throw new ConflictException('해당 카테고리가 존재하지 않습니다.');
    }

    const CityExist = await this.eventRepository.isCityExist(payload.cityId);
    if (!CityExist) {
      throw new ConflictException('해당 도시가 존재하지 않습니다.');
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

  async joinEvent(eventId: number, userId: number): Promise<void> {
    const user = await this.eventRepository.isUserExist(userId);
    if (!user) {
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new NotFoundException('모임이 존재하지 않습니다.');
    }

    const userJoinedEvent = await this.eventRepository.isUserJoinedEvent(
      userId,
      eventId,
    );
    if (userJoinedEvent) {
      throw new ConflictException('이미 참가한 모임입니다.');
    }

    if (event.endTime < new Date()) {
      throw new ConflictException('이미 종료된 모임에는 참가할 수 없습니다.');
    }

    const currentParticipantCount =
      await this.eventRepository.getEventParticipantCount(eventId);

    if (event.maxPeople == currentParticipantCount) {
      throw new ConflictException('이미 정원이 다 찼습니다.');
    }

    await this.eventRepository.joinEvent(userId, eventId);
  }

  async outEvent(eventId: number, userId: number): Promise<void> {
    const user = await this.eventRepository.isUserExist(userId);
    if (!user) {
      throw new ConflictException('해당 유저가 존재하지 않습니다.');
    }

    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      throw new ConflictException('모임이 존재하지 않습니다.');
    }

    const userJoinedEvent = await this.eventRepository.isUserJoinedEvent(
      userId,
      eventId,
    );
    if (!userJoinedEvent) {
      throw new ConflictException('참가하지 않은 모임입니다.');
    }

    if (event.endTime < new Date()) {
      throw new ConflictException('이미 종료된 모임에서는 나갈 수 없습니다.');
    }

    if (event.hostId == userId) {
      throw new ConflictException('호스트는 모임에서 나갈 수 없습니다.');
    }

    await this.eventRepository.outEvent(userId, eventId);
  }
}
