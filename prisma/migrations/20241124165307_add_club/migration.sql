-- CreateEnum
CREATE TYPE "ClubJoinStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "club_id" INTEGER;

-- CreateTable
CREATE TABLE "club" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "leader_id" INTEGER NOT NULL,
    "max_people" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_join" (
    "id" SERIAL NOT NULL,
    "club_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "club_join_status" "ClubJoinStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_join_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "club_join_club_id_user_id_key" ON "club_join"("club_id", "user_id");

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club" ADD CONSTRAINT "club_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_join" ADD CONSTRAINT "club_join_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_join" ADD CONSTRAINT "club_join_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
