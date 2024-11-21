import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiNoContentResponse,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { UpdateUserPayload } from './payload/update-user.payload';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete(':userId')
  @HttpCode(204)
  @ApiOperation({ summary: '유저 탈퇴' })
  @ApiNoContentResponse()
  async deleteUser(@Param('userId') userId: number): Promise<void> {
    return this.userService.deleteUser(userId);
  }

  @Get(':userId')
  @HttpCode(200)
  @ApiOperation({ summary: '특정 id의 유저 데이터를 가져옵니다' })
  @ApiOkResponse({ type: UserDto })
  async getUserInfoById(@Param('userId') userId: number): Promise<UserDto> {
    return this.userService.getUserInfoById(userId);
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: '유저 정보를 수정합니다' })
  @ApiOkResponse({ type: UserDto })
  async updateUser(
    @Param('userId') userId: number,
    @Body() payload: UpdateUserPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<UserDto> {
    return this.userService.updateUser(userId, payload, user);
  }
}
