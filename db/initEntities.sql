PRAGMA foreign_keys=OFF;

-- CreateTable
DROP TABLE IF EXISTS user;
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "hashed_password" BLOB NOT NULL,
    "fname" TEXT,
    "lname" TEXT,
    "country" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "salt" BLOB NOT NULL
);

-- CreateTable
DROP TABLE IF EXISTS factoid;
CREATE TABLE "Factoid" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "submitter_id" TEXT,
    "content" TEXT NOT NULL,
    "posting_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discovery_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approval_date" DATETIME,
    CONSTRAINT "Factoid_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
DROP TABLE IF EXISTS category;
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
DROP TABLE IF EXISTS tag;
CREATE TABLE "Tag" (
    "factoid_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    PRIMARY KEY ("factoid_id", "category_id"),
    CONSTRAINT "Tag_factoid_id_fkey" FOREIGN KEY ("factoid_id") REFERENCES "Factoid" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tag_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
DROP TABLE IF EXISTS attachment;
CREATE TABLE "Attachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "factoid_id" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "Attachment_factoid_id_fkey" FOREIGN KEY ("factoid_id") REFERENCES "Factoid" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "attachment_type_check" CHECK ("type" in ('image', 'audio', 'website', 'youtube'))
);

-- CreateTable
DROP TABLE IF EXISTS report;
CREATE TABLE "Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "factoid_id" INTEGER NOT NULL,
    "submitter_id" TEXT,
    "issue" TEXT NOT NULL,
    "submission_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_factoid_id_fkey" FOREIGN KEY ("factoid_id") REFERENCES "Factoid" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Report_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
DROP TABLE IF EXISTS Anon_User;
CREATE TABLE "Anon_User" (
    "factoid_id" INTEGER NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "country" TEXT,
    CONSTRAINT "Anon_User_factoid_id_fkey" FOREIGN KEY ("factoid_id") REFERENCES "Factoid" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
DROP INDEX IF EXISTS User_email_key;
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
DROP INDEX IF EXISTS Category_name_key;
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

DROP TABLE IF EXISTS sessions;

PRAGMA foreign_keys=ON;