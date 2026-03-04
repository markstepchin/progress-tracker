-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "notes" TEXT,
    "frontPhoto" TEXT NOT NULL,
    "sidePhoto" TEXT NOT NULL,
    "backPhoto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckIn_date_idx" ON "CheckIn"("date");
