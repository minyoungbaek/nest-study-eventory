import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateClubData } from './type/create-club-data.type';
import { ClubData } from './type/club-data.type';
import { ClubJoinStatus } from '@prisma/client';
import { UpdateClubData } from './type/update-club-data.type';

@Injectable()
export class ClubRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createClub(data: CreateClubData): Promise<ClubData> {
    return this.prisma.club.create({
      data: {
        name: data.name,
        description: data.description,
        leaderId: data.leaderId,
        maxPeople: data.maxPeople,
        clubJoin: {
          create: {
            userId: data.leaderId,
            status: ClubJoinStatus.ACCEPTED,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        leaderId: true,
        maxPeople: true,
      },
    });
  }

  async getClubById(clubId: number): Promise<ClubData | null> {
    return this.prisma.club.findUnique({
      where: {
        id: clubId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        leaderId: true,
        maxPeople: true,
      },
    });
  }

  async getClubMemberCount(clubId: number): Promise<number> {
    return this.prisma.clubJoin.count({
      where: {
        clubId: clubId,
        status: ClubJoinStatus.ACCEPTED,
      },
    });
  }

  async updateClub(clubId: number, data: UpdateClubData): Promise<ClubData> {
    return this.prisma.club.update({
      where: {
        id: clubId,
      },
      data: {
        name: data.name,
        description: data.description,
        maxPeople: data.maxPeople,
      },
      select: {
        id: true,
        name: true,
        description: true,
        leaderId: true,
        maxPeople: true,
      },
    });
  }

  async getClubs(): Promise<ClubData[]> {
    return this.prisma.club.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        leaderId: true,
        maxPeople: true,
      },
    });
  }

  async getMyClubs(userId: number): Promise<ClubData[]> {
    return this.prisma.club.findMany({
      where: {
        deletedAt: null,
        clubJoin: {
          some: {
            userId: userId,
            status: ClubJoinStatus.ACCEPTED,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        leaderId: true,
        maxPeople: true,
      },
    });
  }

  async isUserJoinedClub(userId: number, clubId: number): Promise<boolean> {
    const clubJoin = await this.prisma.clubJoin.findUnique({
      where: {
        clubId_userId: {
          clubId,
          userId,
        },
        status: ClubJoinStatus.ACCEPTED,
      },
    });

    return !!clubJoin;
  }

  async joinClub(userId: number, clubId: number): Promise<void> {
    await this.prisma.clubJoin.create({
      data: {
        userId,
        clubId,
        status: ClubJoinStatus.PENDING,
      },
      select: {
        id: true,
        userId: true,
        clubId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteClub(clubId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.club.update({
        where: {
          id: clubId,
        },
        data: {
          deletedAt: new Date(),
        },
      }),
      this.prisma.clubJoin.deleteMany({
        where: {
          clubId,
        },
      }),
      this.prisma.eventJoin.deleteMany({
        where: {
          event: {
            clubId: clubId,
            startTime: {
              gt: new Date(),
            },
          },
        },
      }),
      this.prisma.eventCity.deleteMany({
        where: {
          event: {
            clubId: clubId,
            startTime: {
              gt: new Date(),
            },
          },
        },
      }),
      this.prisma.event.deleteMany({
        where: {
          clubId: clubId,
          startTime: {
            gt: new Date(),
          },
        },
      }),
    ]);
  }

  async getUserJoinedClubs(userId: number): Promise<number[]> {
    const joinedClubs = await this.prisma.clubJoin.findMany({
      where: {
        userId: userId,
        status: ClubJoinStatus.ACCEPTED,
      },
      select: {
        clubId: true,
      },
    });

    return joinedClubs.map((clubJoin) => clubJoin.clubId);
  }

  async getClubDeletedStatus(
    clubIds: number[],
  ): Promise<Record<number, boolean>> {
    if (clubIds.length === 0) {
      return {};
    }

    const clubs = await this.prisma.club.findMany({
      where: {
        id: {
          in: clubIds,
        },
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    const clubStatusMap: Record<number, boolean> = {};

    clubs.forEach((club) => {
      clubStatusMap[club.id] = !!club.deletedAt;
    });

    clubIds.forEach((clubId) => {
      if (!(clubId in clubStatusMap)) {
        clubStatusMap[clubId] = false;
      }
    });

    return clubStatusMap;
  }
}
