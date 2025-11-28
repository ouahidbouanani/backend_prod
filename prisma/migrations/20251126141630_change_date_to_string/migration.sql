/*
  Warnings:

  - The primary key for the `lot_status` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id_lot` on the `lot_status` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `Int`.
  - Made the column `date_debut` on table `debut_etching` required. This step will fail if there are existing NULL values in that column.
  - Made the column `heure_debut` on table `debut_etching` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `debut_etching` MODIFY `date_debut` VARCHAR(191) NOT NULL,
    MODIFY `heure_debut` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `lot_status` DROP PRIMARY KEY,
    MODIFY `id_lot` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id_lot`);

-- AddForeignKey
ALTER TABLE `cote_piece` ADD CONSTRAINT `cote_piece_piece_id_fkey` FOREIGN KEY (`piece_id`) REFERENCES `piece`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
