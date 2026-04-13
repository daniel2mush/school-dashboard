CREATE TABLE "SchoolSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSetting_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SchoolSetting" ("id", "name", "description",  "term", "year", "language", "logo", "createdAt", "updatedAt")
VALUES (1, 'Sunridge International School', 'Where Eductation meets performance', 'Term 2', '2026', 'en', '/logo.svg', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
