import { Module } from '@nestjs/common';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import { ClubRepository } from './club.repository';

@Module({
  controllers: [ClubController],
  providers: [ClubService, ClubRepository],
})
export class ClubModule {}
