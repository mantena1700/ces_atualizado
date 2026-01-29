-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "admissionDate" DATETIME,
    "jobRoleId" TEXT,
    "salary" DECIMAL NOT NULL DEFAULT 0,
    "gradeId" TEXT,
    "stepId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_jobRoleId_fkey" FOREIGN KEY ("jobRoleId") REFERENCES "JobRole" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
