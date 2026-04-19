ALTER TABLE "SchoolSetting"
ADD COLUMN "description" TEXT NOT NULL DEFAULT '';

UPDATE "SchoolSetting"
SET "description" = 'Where Education meets performance'
WHERE "description" = '';

ALTER TABLE "SchoolSetting"
ALTER COLUMN "description" DROP DEFAULT;
