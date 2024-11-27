import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ClubRepository } from './club.repository';
import { CreateClubPayload } from './payload/create-club.payload';
import { UpdateClubPayload } from './payload/update-club.payload';
import { ClubDto, ClubListDto } from './dto/club.dto';
import { CreateClubData } from './type/create-club-data.type';
import { UpdateClubData } from './type/update-club-data.type';
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

  async getClubById(clubId: number): Promise<ClubDto> {
    const club = await this.clubRepository.getClubById(clubId);

    if (!club) {
      throw new NotFoundException('클럽이 존재하지 않습니다.');
    }

    return ClubDto.from(club);
  }

  async updateClub(
    clubId: number,
    payload: UpdateClubPayload,
    user: UserBaseInfo,
  ): Promise<ClubDto> {
    const club = await this.clubRepository.getClubById(clubId);

    if (!club) {
      throw new NotFoundException('클럽이 존재하지 않습니다.');
    }

    if (club.leaderId !== user.id) {
      throw new ForbiddenException('클럽은 클럽장만 수정이 가능합니다.');
    }

    if (payload.name === null) {
      throw new BadRequestException('클럽 이름은 null이 될 수 없습니다.');
    }
    if (payload.description === null) {
      throw new BadRequestException('클럽 설명은 null이 될 수 없습니다.');
    }
    if (payload.maxPeople === null) {
      throw new BadRequestException('최대 인원은 null이 될 수 없습니다.');
    }

    if (payload.maxPeople) {
      const clubJoinCount =
        await this.clubRepository.getClubMemberCount(clubId);

      if (payload.maxPeople < clubJoinCount) {
        throw new ConflictException(
          '새로운 클럽 정원은 현재 클럽 인원보다 작을 수 없습니다.',
        );
      }
    }

    const updateData: UpdateClubData = {
      name: payload.name,
      description: payload.description,
      maxPeople: payload.maxPeople,
    };

    const updatedClub = await this.clubRepository.updateClub(
      clubId,
      updateData,
    );

    return ClubDto.from(updatedClub);
  }
}
