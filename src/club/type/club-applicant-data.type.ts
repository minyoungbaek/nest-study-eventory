import { ClubJoinStatus } from '@prisma/client';

export type ClubApplicantData = {
  id: number;
  userId: number;
  clubId: number;
  status: ClubJoinStatus;
};
