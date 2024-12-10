import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateReviewData } from './type/create-review-data.type';
import { ReviewData } from './type/review-data.type';
import { User, Event } from '@prisma/client';
import { ReviewQuery } from './query/review.query';
import { UpdateReviewData } from './type/update-review-data.type';
import { UserBaseInfo } from '../auth/type/user-base-info.type';
import { EventData } from '../event/type/event-data.type';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(data: CreateReviewData): Promise<ReviewData> {
    return this.prisma.review.create({
      data: {
        userId: data.userId,
        eventId: data.eventId,
        score: data.score,
        title: data.title,
        description: data.description,
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async getUserById(userId: number): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
  }

  async getEventById(eventId: number): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
  }

  async getEventsByIds(eventIds: number[]): Promise<EventData[]> {
    return this.prisma.event.findMany({
      where: {
        id: { in: eventIds },
      },
      select: {
        id: true,
        hostId: true,
        title: true,
        description: true,
        clubId: true,
        categoryId: true,
        eventCity: {
          select: {
            id: true,
            cityId: true,
          },
        },
        startTime: true,
        endTime: true,
        maxPeople: true,
      },
    });
  }

  async isReviewExist(userId: number, eventId: number): Promise<boolean> {
    const review = await this.prisma.review.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
        user: {
          deletedAt: null,
        },
      },
    });

    return !!review;
  }

  async isUserJoinedEvent(userId: number, eventId: number): Promise<boolean> {
    const event = await this.prisma.eventJoin.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
        user: {
          deletedAt: null,
        },
      },
    });

    return !!event;
  }

  async getReviewById(reviewId: number): Promise<ReviewData | null> {
    return this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async getReviews(
    query: ReviewQuery,
    user: UserBaseInfo,
  ): Promise<ReviewData[]> {
    const joinedClubs = await this.prisma.clubJoin
      .findMany({
        where: {
          userId: user.id,
          status: 'ACCEPTED',
        },
        select: {
          clubId: true,
        },
      })
      .then((clubJoins) => clubJoins.map((clubJoin) => clubJoin.clubId));

    const joinedEvents = await this.prisma.eventJoin
      .findMany({
        where: {
          userId: user.id,
        },
        select: {
          eventId: true,
        },
      })
      .then((eventJoins) => eventJoins.map((eventJoin) => eventJoin.eventId));

    return this.prisma.review.findMany({
      where: {
        AND: [
          { eventId: query.eventId },
          {
            OR: [
              { event: { clubId: null } },
              { event: { clubId: { in: joinedClubs } } },
              {
                AND: [
                  { event: { endTime: { lte: new Date() } } },
                  { event: { clubId: null } },
                  { eventId: { in: joinedEvents } },
                ],
              },
            ],
          },
        ],
        user: {
          deletedAt: null,
          id: query.userId,
        },
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async updateReview(
    reviewId: number,
    data: UpdateReviewData,
  ): Promise<ReviewData> {
    return this.prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        score: data.score,
        title: data.title,
        description: data.description,
      },
      select: {
        id: true,
        userId: true,
        eventId: true,
        score: true,
        title: true,
        description: true,
      },
    });
  }

  async deleteReview(reviewId: number): Promise<void> {
    await this.prisma.review.delete({
      where: {
        id: reviewId,
      },
    });
  }
}
