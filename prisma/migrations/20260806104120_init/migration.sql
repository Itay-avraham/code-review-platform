-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "analysisData" JSONB NOT NULL,
    "vulnerabilityCount" INTEGER NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Report_scanId_key" ON "Report"("scanId");

-- AddForeignKey
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
