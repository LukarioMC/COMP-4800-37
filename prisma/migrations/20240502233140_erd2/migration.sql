/*
  Warnings:

  - Added the required column `type` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "factoid_id" INTEGER NOT NULL,
    "link" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "Attachment_factoid_id_fkey" FOREIGN KEY ("factoid_id") REFERENCES "Factoid" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT type_check CHECK (type IN ('image', 'video', 'sound', 'website'))
);
INSERT INTO "new_Attachment" ("factoid_id", "id", "link") SELECT "factoid_id", "id", "link" FROM "Attachment";
DROP TABLE "Attachment";
ALTER TABLE "new_Attachment" RENAME TO "Attachment";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;