/*
  Warnings:

  - Made the column `hashed_password` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `Session` required. This step will fail if there are existing NULL values in that column.
  - Made the column `link` on table `Attachment` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "fname" TEXT,
    "lname" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("email", "fname", "hashed_password", "id", "is_admin", "lname") SELECT "email", "fname", "hashed_password", "id", "is_admin", "lname" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT NOT NULL,
    "expiry_time" DATETIME NOT NULL,
    CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("expiry_time", "id", "user_id") SELECT "expiry_time", "id", "user_id" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_user_id_key" ON "Session"("user_id");
CREATE TABLE "new_Attachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "factoid_id" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "Attachment_factoid_id_fkey" FOREIGN KEY ("factoid_id") REFERENCES "Factoid" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attachment" ("factoid_id", "id", "link", "type") SELECT "factoid_id", "id", "link", "type" FROM "Attachment";
DROP TABLE "Attachment";
ALTER TABLE "new_Attachment" RENAME TO "Attachment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
