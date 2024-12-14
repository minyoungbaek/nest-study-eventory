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
import {
  ClubApplicantDto,
  ClubApplicantListDto,
} from './dto/club-applicant.dto';
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

  @Delete(':clubId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiOperation({ summary: '클럽을 삭제합니다' })
  @ApiNoContentResponse()
  async deleteClub(
    @Param('clubId', ParseIntPipe) clubId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.clubService.deleteClub(clubId, user);
  }

  @Post(':clubId/out')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '클럽에서 탈퇴합니다' })
  @ApiNoContentResponse()
  @HttpCode(204)
  async outClub(
    @Param('clubId', ParseIntPipe) clubId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.clubService.outClub(clubId, user);
  }

  @Get(':clubId/applicants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '클럽 가입 신청자 목록을 조회합니다' })
  @ApiOkResponse({ type: ClubApplicantListDto })
  async getApplicants(
    @Param('clubId', ParseIntPipe) clubId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<ClubApplicantListDto> {
    return this.clubService.getApplicants(clubId, user);
  }

  @Patch(':clubId/approve/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '클럽 가입 신청을 승인합니다' })
  @HttpCode(204)
  @ApiNoContentResponse()
  async approveApplicant(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.clubService.approveApplicant(clubId, userId, user);
  }

  @Delete(':clubId/reject/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '클럽 가입 신청을 거절합니다' })
  @HttpCode(204)
  @ApiNoContentResponse()
  async rejectApplicant(
    @Param('clubId', ParseIntPipe) clubId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.clubService.rejectApplicant(clubId, userId, user);
  }
}
