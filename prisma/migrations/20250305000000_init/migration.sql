-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "zoom" DOUBLE PRECISION,
    "panX" DOUBLE PRECISION,
    "panY" DOUBLE PRECISION,
    "brightness" DOUBLE PRECISION,
    "contrast" DOUBLE PRECISION,
    "rotation" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "notes" TEXT,
    "frontPhotoId" TEXT NOT NULL,
    "sidePhotoId" TEXT NOT NULL,
    "backPhotoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_frontPhotoId_key" ON "CheckIn"("frontPhotoId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_sidePhotoId_key" ON "CheckIn"("sidePhotoId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_backPhotoId_key" ON "CheckIn"("backPhotoId");

-- CreateIndex
CREATE INDEX "CheckIn_date_idx" ON "CheckIn"("date");

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_frontPhotoId_fkey" FOREIGN KEY ("frontPhotoId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_sidePhotoId_fkey" FOREIGN KEY ("sidePhotoId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_backPhotoId_fkey" FOREIGN KEY ("backPhotoId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;
