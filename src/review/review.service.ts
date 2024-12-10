import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewRepository } from './review.repository';
import { CreateReviewPayload } from './payload/create-review.payload';
import { ReviewDto, ReviewListDto } from './dto/review.dto';
import { CreateReviewData } from './type/create-review-data.type';
import { ReviewQuery } from './query/review.query';
import { UpdateReviewData } from './type/update-review-data.type';
import { PutUpdateReviewPayload } from './payload/put-update-review.payload';
import { PatchUpdateReviewPayload } from './payload/patch-update-review.payload';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { ReviewData } from './type/review-data.type';
import { ClubRepository } from 'src/club/club.repository';
import { EventRepository } from 'src/event/event.repository';

@Injectable()
export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly clubRepository: ClubRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async createReview(
    payload: CreateReviewPayload,
    user: UserBaseInfo,
  ): Promise<ReviewDto> {
    const isReviewExist = await this.reviewRepository.isReviewExist(
      user.id,
      payload.eventId,
    );
    if (isReviewExist) {
      throw new ConflictException('해당 유저의 리뷰가 이미 존재합니다.');
    }

    const isUserJoinedEvent = await this.reviewRepository.isUserJoinedEvent(
      user.id,
      payload.eventId,
    );
    if (!isUserJoinedEvent) {
      throw new ConflictException('해당 유저가 이벤트에 참가하지 않았습니다.');
    }

    const event = await this.reviewRepository.getEventById(payload.eventId);
    if (!event) {
      throw new NotFoundException('Event가 존재하지 않습니다.');
    }

    if (event.endTime > new Date()) {
      throw new ConflictException(
        'Event가 종료되지 않았습니다. 아직 리뷰를 작성할 수 없습니다.',
      );
    }

    if (event.hostId === user.id) {
      throw new ConflictException(
        '자신이 주최한 이벤트에는 리뷰를 작성 할 수 없습니다.',
      );
    }

    const createData: CreateReviewData = {
      userId: user.id,
      eventId: payload.eventId,
      score: payload.score,
      title: payload.title,
      description: payload.description,
    };

    const review = await this.reviewRepository.createReview(createData);

    return ReviewDto.from(review);
  }

  async getReviewById(
    reviewId: number,
    user: UserBaseInfo,
  ): Promise<ReviewDto> {
    const review = await this.reviewRepository.getReviewById(reviewId);

    if (!review) {
      throw new NotFoundException('Review가 존재하지 않습니다.');
    }

    const event = await this.reviewRepository.getEventById(review.eventId);
    if (!event) {
      throw new NotFoundException('Event가 존재하지 않습니다.');
    }

    if (event.clubId) {
      const userJoinedClub = await this.clubRepository.isUserJoinedClub(
        user.id,
        event.clubId,
      );
      if (!userJoinedClub) {
        throw new ForbiddenException('클럽원만 열람할 수 있는 리뷰입니다.');
      }
    }

    return ReviewDto.from(review);
  }

  async getReviews(
    query: ReviewQuery,
    user: UserBaseInfo,
  ): Promise<ReviewListDto> {
    const reviews = await this.reviewRepository.getReviews(query, user);

    if (!reviews || reviews.length === 0) {
      return ReviewListDto.from([]);
    }

    const eventIds = reviews.map((review) => review.eventId);
    const events = await this.reviewRepository.getEventsByIds(eventIds);

    const cludIds = events
      .filter((event) => event.clubId !== null)
      .map((event) => event.clubId as number);

    const userJoinedClubs = await this.clubRepository.getUserJoinedClubs(
      user.id,
    );
    const userJoinedEvents = await this.eventRepository.getUserJoinedEvents(
      user.id,
    );
    const clubDeletedStatus =
      await this.clubRepository.getClubDeletedStatus(cludIds);

    const filteredReviews = reviews.filter((review) => {
      const event = events.find((event) => event.id === review.eventId);
      if (!event || !event.clubId) {
        return true;
      }

      const clubDeleted = clubDeletedStatus[event.clubId] ?? false;
      if (clubDeleted) {
        return userJoinedEvents.includes(event.id);
      }

      return userJoinedClubs.includes(event.clubId);
    });

    return ReviewListDto.from(filteredReviews);
  }

  async putUpdateReview(
    reviewId: number,
    payload: PutUpdateReviewPayload,
    user: UserBaseInfo,
  ): Promise<ReviewDto> {
    await this.checkPermissionForModifyReview(reviewId, user.id);

    const updateData: UpdateReviewData = {
      score: payload.score,
      title: payload.title,
      description: payload.description ?? null,
    };

    const updatedReview = await this.reviewRepository.updateReview(
      reviewId,
      updateData,
    );

    return ReviewDto.from(updatedReview);
  }

  async patchUpdateReview(
    reviewId: number,
    payload: PatchUpdateReviewPayload,
    user: UserBaseInfo,
  ): Promise<ReviewDto> {
    if (payload.score === null) {
      throw new BadRequestException('score는 null이 될 수 없습니다.');
    }

    if (payload.title === null) {
      throw new BadRequestException('title은 null이 될 수 없습니다.');
    }

    await this.checkPermissionForModifyReview(reviewId, user.id);

    const updateData: UpdateReviewData = {
      score: payload.score,
      title: payload.title,
      description: payload.description,
    };

    const updatedReview = await this.reviewRepository.updateReview(
      reviewId,
      updateData,
    );

    return ReviewDto.from(updatedReview);
  }

  async deleteReview(reviewId: number, user: UserBaseInfo): Promise<void> {
    await this.checkPermissionForModifyReview(reviewId, user.id);

    await this.reviewRepository.deleteReview(reviewId);
  }

  private async checkPermissionForModifyReview(
    reviewId: number,
    userId: number,
  ): Promise<void> {
    const review = await this.reviewRepository.getReviewById(reviewId);

    if (!review) {
      throw new NotFoundException('Review가 존재하지 않습니다.');
    }

    if (review.userId !== userId) {
      throw new ConflictException('해당 리뷰를 삭제할 권한이 없습니다.');
    }
  }
}
