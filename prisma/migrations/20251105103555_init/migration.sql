/*
  Warnings:

  - The primary key for the `fin_tomo` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `debut_etching` MODIFY `position` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `fin_tomo` DROP PRIMARY KEY,
    MODIFY `id_lot` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id_lot`);
