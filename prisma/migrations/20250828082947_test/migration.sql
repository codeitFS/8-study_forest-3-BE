-- DropTable
DROP TABLE "public"."STUDY";

-- CreateTable
CREATE TABLE "public"."studies" (
    "study_id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "background" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studies_pkey" PRIMARY KEY ("study_id")
);

-- CreateTable
CREATE TABLE "public"."habits" (
    "habit_id" SERIAL NOT NULL,
    "study_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "weekly_clear" TEXT NOT NULL DEFAULT '0|0|0|0|0|0|0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("habit_id")
);

-- CreateTable
CREATE TABLE "public"."habit_records" (
    "record_id" SERIAL NOT NULL,
    "study_id" INTEGER NOT NULL,
    "habit_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "habit_records_pkey" PRIMARY KEY ("record_id")
);

-- CreateTable
CREATE TABLE "public"."focus_sessions" (
    "focus_id" SERIAL NOT NULL,
    "study_id" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "focus_sessions_pkey" PRIMARY KEY ("focus_id")
);

-- CreateTable
CREATE TABLE "public"."emojis" (
    "emoji_id" SERIAL NOT NULL,
    "emoji" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emojis_pkey" PRIMARY KEY ("emoji_id")
);

-- CreateTable
CREATE TABLE "public"."study_emoji" (
    "study_emoji_id" SERIAL NOT NULL,
    "study_id" INTEGER NOT NULL,
    "emoji_id" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_emoji_pkey" PRIMARY KEY ("study_emoji_id")
);

-- CreateIndex
CREATE INDEX "habits_study_id_idx" ON "public"."habits"("study_id");

-- CreateIndex
CREATE UNIQUE INDEX "habit_records_study_id_key" ON "public"."habit_records"("study_id");

-- CreateIndex
CREATE INDEX "habit_records_habit_id_idx" ON "public"."habit_records"("habit_id");

-- CreateIndex
CREATE INDEX "habit_records_study_id_idx" ON "public"."habit_records"("study_id");

-- CreateIndex
CREATE UNIQUE INDEX "focus_sessions_study_id_key" ON "public"."focus_sessions"("study_id");

-- CreateIndex
CREATE INDEX "focus_sessions_study_id_idx" ON "public"."focus_sessions"("study_id");

-- CreateIndex
CREATE INDEX "study_emoji_study_id_idx" ON "public"."study_emoji"("study_id");

-- CreateIndex
CREATE INDEX "study_emoji_emoji_id_idx" ON "public"."study_emoji"("emoji_id");

-- CreateIndex
CREATE UNIQUE INDEX "study_emoji_study_id_emoji_id_key" ON "public"."study_emoji"("study_id", "emoji_id");

-- AddForeignKey
ALTER TABLE "public"."habits" ADD CONSTRAINT "habits_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("study_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_records" ADD CONSTRAINT "habit_records_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("study_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habit_records" ADD CONSTRAINT "habit_records_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("habit_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."focus_sessions" ADD CONSTRAINT "focus_sessions_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("study_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."study_emoji" ADD CONSTRAINT "study_emoji_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."studies"("study_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."study_emoji" ADD CONSTRAINT "study_emoji_emoji_id_fkey" FOREIGN KEY ("emoji_id") REFERENCES "public"."emojis"("emoji_id") ON DELETE CASCADE ON UPDATE CASCADE;
