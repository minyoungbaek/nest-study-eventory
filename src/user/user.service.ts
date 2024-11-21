import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDto } from './dto/user.dto';
import { UpdateUserPayload } from './payload/update-user.payload';
import { UpdateUserData } from './type/update-user-data.type';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userRepository.deleteUser(userId);
  }

  async getUserInfoById(userId: number): Promise<UserDto> {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserDto.from(user);
  }

  async updateUser(
    userId: number,
    payload: UpdateUserPayload,
    user: UserBaseInfo,
  ): Promise<UserDto> {
    if (userId !== user.id) {
      throw new ForbiddenException(
        '유저 정보를 수정할 수 있는 권한이 없습니다.',
      );
    }

    if (payload.email === null) {
      throw new BadRequestException('이메일은 null이 될 수 없습니다.');
    }
    if (payload.name === null) {
      throw new BadRequestException('이름은 null이 될 수 없습니다.');
    }
    if (payload.categoryId === null) {
      throw new BadRequestException('카테고리는 null이 될 수 없습니다.');
    }

    if (payload.email) {
      const emailUnique = await this.userRepository.isEmailUnique(
        payload.email,
      );

      if (!emailUnique) {
        throw new ConflictException('중복된 이메일이 존재합니다.');
      }
    }

    if (payload.birthday) {
      if (payload.birthday > new Date()) {
        throw new ConflictException('생일은 현재 시간 이후일 수 없습니다.');
      }
    }

    if (payload.cityId != undefined) {
      if (payload.cityId == 0) {
        throw new NotFoundException('해당 지역이 존재하지 않습니다.');
      }

      const validCityId = await this.userRepository.isCityExist(payload.cityId);

      if (!validCityId) {
        throw new NotFoundException('존재하지 않는 지역입니다.');
      }
    }

    if (payload.categoryId) {
      const validCategoryId = await this.userRepository.isCategoryExist(
        payload.categoryId,
      );

      if (!validCategoryId) {
        throw new NotFoundException('해당 카테고리가 존재하지 않습니다.');
      }
    }

    const updateData: UpdateUserData = {
      email: payload.email,
      name: payload.name,
      birthday: payload.birthday,
      cityId: payload.cityId,
      categoryId: payload.categoryId,
    };

    const updatedUser = await this.userRepository.updateUser(
      userId,
      updateData,
    );

    return UserDto.from(updatedUser);
  }
}
