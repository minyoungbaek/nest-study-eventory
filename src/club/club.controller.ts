import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Get,
  ParseIntPipe,
  Patch,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ClubService } from './club.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateClubPayload } from './payload/create-club.payload';
import { ClubDto, ClubListDto } from './dto/club.dto';
import { UpdateClubPayload } from './payload/update-club.payload';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserBaseInfo } from '../auth/type/user-base-info.type';

@Controller('clubs')
@ApiTags('Club API')
export class ClubController {
  constructor(private readonly clubService: ClubService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '새로운 클럽을 추가합니다' })
  @ApiCreatedResponse({ type: ClubDto })
  async createClub(
    @Body() payload: CreateClubPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ClubDto> {
    return this.clubService.createClub(payload, user);
  }

  @Get(':me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내가 가입한 클럽 정보를 조회합니다' })
  @ApiOkResponse({ type: ClubListDto })
  async getMyClubs(@CurrentUser() user: UserBaseInfo): Promise<ClubListDto> {
    return this.clubService.getMyClubs(user);
  }

  @Get(':clubId')
  @ApiOperation({ summary: '클럽 정보를 조회합니다' })
  @ApiOkResponse({ type: ClubDto })
  async getClubById(
    @Param('clubId', ParseIntPipe) clubId: number,
  ): Promise<ClubDto> {
    return this.clubService.getClubById(clubId);
  }

  @Get()
  @ApiOperation({ summary: '여러 클럽 정보를 조회합니다' })
  @ApiOkResponse({ type: ClubListDto })
  async getClubs(): Promise<ClubListDto> {
    return this.clubService.getClubs();
  }

  @Patch(':clubId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '클럽을 수정합니다' })
  @ApiOkResponse({ type: ClubDto })
  async UpdateEvent(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Body() payload: UpdateClubPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ClubDto> {
    return this.clubService.updateClub(clubId, payload, user);
  }

  @Post(':clubId/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '클럽에 가입 신청합니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async joinClub(
    @Param('clubId', ParseIntPipe) clubId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.clubService.joinClub(clubId, user);
  }
}
