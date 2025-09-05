/*
  Warnings:

  - The primary key for the `emojis` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."study_emoji" DROP CONSTRAINT "study_emoji_emoji_id_fkey";

-- AlterTable
ALTER TABLE "public"."emojis" DROP CONSTRAINT "emojis_pkey",
ALTER COLUMN "emoji_id" DROP DEFAULT,
ALTER COLUMN "emoji_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "emojis_pkey" PRIMARY KEY ("emoji_id");
DROP SEQUENCE "emojis_emoji_id_seq";

-- AlterTable
ALTER TABLE "public"."study_emoji" ALTER COLUMN "emoji_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."study_emoji" ADD CONSTRAINT "study_emoji_emoji_id_fkey" FOREIGN KEY ("emoji_id") REFERENCES "public"."emojis"("emoji_id") ON DELETE CASCADE ON UPDATE CASCADE;
