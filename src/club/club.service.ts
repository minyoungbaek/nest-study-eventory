import { Injectable } from '@nestjs/common';
import { ClubRepository } from './club.repository';
import { CreateClubPayload } from './payload/create-club.payload';
import { ClubDto, ClubListDto } from './dto/club.dto';
import { CreateClubData } from './type/create-club-data.type';
import { UserBaseInfo } from '../auth/type/user-base-info.type';

@Injectable()
export class ClubService {
  constructor(private readonly clubRepository: ClubRepository) {}

  async createClub(
    payload: CreateClubPayload,
    user: UserBaseInfo,
  ): Promise<ClubDto> {
    const createData: CreateClubData = {
      name: payload.name,
      description: payload.description,
      leaderId: user.id,
      maxPeople: payload.maxPeople,
    };

    const club = await this.clubRepository.createClub(createData);

    return ClubDto.from(club);
  }
}
