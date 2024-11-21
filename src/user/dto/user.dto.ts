import { ApiProperty } from '@nestjs/swagger';
import { UserData } from '../type/user-data.type';

export class UserDto {
  @ApiProperty({
    description: '유저 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '유저 이메일',
    type: String,
  })
  email!: string;

  @ApiProperty({
    description: '유저 이름',
    type: String,
  })
  name!: string;

  @ApiProperty({
    description: '유저 생일',
    type: Date,
    nullable: true,
  })
  birthday?: Date | null;

  @ApiProperty({
    description: '거주 지역',
    type: Number,
    nullable: true,
  })
  cityId?: number | null;

  @ApiProperty({
    description: '카테고리',
    type: Number,
  })
  categoryId!: number;

  static from(user: UserData): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      birthday: user.birthday,
      cityId: user.cityId,
      categoryId: user.categoryId,
    };
  }
}
