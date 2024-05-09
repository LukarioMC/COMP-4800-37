/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to alter the column `hashed_password` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Binary`.
  - Added the required column `salt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Session_user_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Session";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "hashed_password" BLOB NOT NULL,
    "fname" TEXT,
    "lname" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "salt" BLOB NOT NULL
);
INSERT INTO "new_User" ("email", "fname", "hashed_password", "id", "is_admin", "lname") SELECT "email", "fname", "hashed_password", "id", "is_admin", "lname" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
