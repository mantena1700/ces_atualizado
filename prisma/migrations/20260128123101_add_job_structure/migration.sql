-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JobRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT,
    "area" TEXT,
    "cbo" TEXT,
    "reportsToId" TEXT,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "gradeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobRole_reportsToId_fkey" FOREIGN KEY ("reportsToId") REFERENCES "JobRole" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "JobRole_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "SalaryGrade" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_JobRole" ("createdAt", "department", "description", "gradeId", "id", "title", "totalPoints", "updatedAt") SELECT "createdAt", "department", "description", "gradeId", "id", "title", "totalPoints", "updatedAt" FROM "JobRole";
DROP TABLE "JobRole";
ALTER TABLE "new_JobRole" RENAME TO "JobRole";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
