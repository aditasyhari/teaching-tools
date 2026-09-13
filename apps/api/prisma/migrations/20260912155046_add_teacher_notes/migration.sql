-- CreateTable
CREATE TABLE "TeacherNote" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classroomId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherNote_teacherId_idx" ON "TeacherNote"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherNote_classroomId_idx" ON "TeacherNote"("classroomId");

-- CreateIndex
CREATE INDEX "TeacherNote_pinned_idx" ON "TeacherNote"("pinned");

-- CreateIndex
CREATE INDEX "TeacherNote_createdAt_idx" ON "TeacherNote"("createdAt");

-- AddForeignKey
ALTER TABLE "TeacherNote" ADD CONSTRAINT "TeacherNote_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherNote" ADD CONSTRAINT "TeacherNote_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
