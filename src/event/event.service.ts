import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventRepository } from './event.repository';
import { CreateEventPayload } from './payload/create-event.payload';
import { EventDto, EventListDto } from './dto/event.dto';
import { EventQuery } from './query/event.query';
import { CreateEventData } from './type/create-event-data.type';
import { PatchUpdateEventPayload } from './payload/patch-update-event.payload';
import { UpdateEventData } from './type/update-event-data.type';

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
      throw new NotFoundException('해당 유저가 존재하지 않습니다.');
    }

    const CategoryExist = await this.eventRepository.isCategoryExist(
      payload.categoryId,
    );
    if (!CategoryExist) {
      throw new NotFoundException('해당 카테고리가 존재하지 않습니다.');
    }

    const CityExist = await this.eventRepository.isCityExist(payload.cityId);
    if (!CityExist) {
      throw new NotFoundException('해당 도시가 존재하지 않습니다.');
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

  async patchUpdateEvent(
    eventId: number,
    payload: PatchUpdateEventPayload,
  ): Promise<EventDto> {
    const event = await this.eventRepository.getEventById(eventId);

    if (!event) {
      throw new NotFoundException('모임이 존재하지 않습니다.');
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
    if (payload.cityId === null) {
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
    if (payload.cityId != undefined) {
      if (payload.cityId == 0) {
        throw new NotFoundException('해당 도시가 존재하지 않습니다.');
      }

      const CityExist = await this.eventRepository.isCityExist(payload.cityId);
      if (!CityExist) {
        throw new NotFoundException('해당 도시가 존재하지 않습니다.');
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
      cityId: payload.cityId,
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

  async deleteEvent(eventId: number): Promise<void> {
    const event = await this.eventRepository.getEventById(eventId);

    if (!event) {
      throw new NotFoundException('모임이 존재하지 않습니다.');
    }

    //시작전까지만 삭제 가능
    if (event.startTime < new Date()) {
      throw new ConflictException('이미 시작된 모임은 삭제할 수 없습니다.');
    }

    await this.eventRepository.deleteEvent(eventId);
  }
}
