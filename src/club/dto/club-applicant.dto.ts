import { ApiProperty } from '@nestjs/swagger';
import { ClubApplicantData } from '../type/club-applicant-data.type';

export class ClubApplicantDto {
  @ApiProperty({
    description: '클럽 신청 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '유저 ID',
    type: Number,
  })
  userId!: number;

  static from(applicant: ClubApplicantData): ClubApplicantDto {
    return {
      id: applicant.id,
      userId: applicant.userId,
    };
  }

  static fromArray(applicants: ClubApplicantData[]): ClubApplicantDto[] {
    return applicants.map((applicant) => ClubApplicantDto.from(applicant));
  }
}

export class ClubApplicantListDto {
  @ApiProperty({
    description: '클럽 가입 신청자 목록',
    type: [ClubApplicantDto],
  })
  applicants!: ClubApplicantDto[];

  static from(applicants: ClubApplicantData[]): ClubApplicantListDto {
    return {
      applicants: ClubApplicantDto.fromArray(applicants),
    };
  }
}
