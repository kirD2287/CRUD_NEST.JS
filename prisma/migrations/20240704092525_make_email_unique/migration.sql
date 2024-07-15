/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Roles_value_key";

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
