-- AlterTable
ALTER TABLE `Task` ADD COLUMN `description` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `photo` VARCHAR(191) NULL;
