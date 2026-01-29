-- CreateTable
CREATE TABLE "Factor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FactorLevel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factorId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    CONSTRAINT "FactorLevel_factorId_fkey" FOREIGN KEY ("factorId") REFERENCES "Factor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "gradeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobRole_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "SalaryGrade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobRoleId" TEXT NOT NULL,
    "factorLevelId" TEXT NOT NULL,
    CONSTRAINT "JobScore_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JobScore_factorLevelId_fkey" FOREIGN KEY ("factorLevelId") REFERENCES "FactorLevel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CareerPath" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromRoleId" TEXT NOT NULL,
    "toRoleId" TEXT NOT NULL,
    "requirements" TEXT,
    CONSTRAINT "CareerPath_fromRoleId_fkey" FOREIGN KEY ("fromRoleId") REFERENCES "JobRole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CareerPath_toRoleId_fkey" FOREIGN KEY ("toRoleId") REFERENCES "JobRole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalaryGrade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "minPoints" INTEGER NOT NULL DEFAULT 0,
    "maxPoints" INTEGER NOT NULL DEFAULT 9999
);

-- CreateTable
CREATE TABLE "SalaryStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "percentage" REAL
);

-- CreateTable
CREATE TABLE "SalaryGrid" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gradeId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    CONSTRAINT "SalaryGrid_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "SalaryGrade" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalaryGrid_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "SalaryStep" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "JobScore_jobRoleId_factorLevelId_key" ON "JobScore"("jobRoleId", "factorLevelId");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryGrid_gradeId_stepId_key" ON "SalaryGrid"("gradeId", "stepId");
