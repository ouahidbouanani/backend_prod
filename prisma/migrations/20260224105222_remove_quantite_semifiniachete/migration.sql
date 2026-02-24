/*
  Warnings:

  - The primary key for the `debut_tomo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id_lot` on the `debut_tomo` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Int`.
  - The primary key for the `debuttomo_finis` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `debuttomo_finis` table. All the data in the column will be lost.
  - You are about to drop the column `nb_pieces` on the `debuttomo_finis` table. All the data in the column will be lost.
  - The primary key for the `fin_tomo` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id_lot` on the `fin_tomo` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `version_piece` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `assemblage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `fintomo_finis` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `activite` to the `debuttomo_finis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_debuttomo` to the `debuttomo_finis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nb_puces_disponibles` to the `debuttomo_finis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nb_puces_tomo` to the `debuttomo_finis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `produit_fini` to the `debuttomo_finis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `version_piece` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `debut_tomo` DROP PRIMARY KEY,
    MODIFY `id_lot` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id_lot`);

-- AlterTable
ALTER TABLE `debuttomo_finis` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `nb_pieces`,
    ADD COLUMN `activite` VARCHAR(50) NOT NULL,
    ADD COLUMN `id_debuttomo` VARCHAR(50) NOT NULL,
    ADD COLUMN `nb_puces_disponibles` INTEGER NOT NULL,
    ADD COLUMN `nb_puces_tomo` INTEGER NOT NULL,
    ADD COLUMN `produit_fini` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`id_debuttomo`);

-- AlterTable
ALTER TABLE `fin_etching` MODIFY `date_fin` VARCHAR(191) NOT NULL,
    MODIFY `heure_fin` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `fin_tomo` DROP PRIMARY KEY,
    MODIFY `id_lot` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id_lot`);

-- AlterTable
ALTER TABLE `lot_status` ADD COLUMN `disponible_finis` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `version_piece` DROP PRIMARY KEY,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `assemblage`;

-- DropTable
DROP TABLE `fintomo_finis`;

-- CreateTable
CREATE TABLE `semifiniachete` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `semifiniachete_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produitfini` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produitfinireference` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produitFiniId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `quantite` INTEGER NOT NULL,
    `tracerNumeroLot` BOOLEAN NOT NULL DEFAULT false,

    INDEX `produitfinireference_produitFiniId_idx`(`produitFiniId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semifinipreassemblage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semifinipreassemblagereference` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `semiFiniPreAssemblageId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `quantite` INTEGER NOT NULL,
    `tracerNumeroLot` BOOLEAN NOT NULL DEFAULT false,

    INDEX `semifinipreassemblagereference_semiFiniPreAssemblageId_idx`(`semiFiniPreAssemblageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debut_preassemblage` (
    `id_debutpreassemblage` VARCHAR(50) NOT NULL,
    `activite` VARCHAR(50) NOT NULL,
    `produit_fini` VARCHAR(50) NOT NULL,
    `lot_corps` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `operateur` VARCHAR(20) NOT NULL,
    `piece_disponible` INTEGER NOT NULL DEFAULT 0,
    `quantite_utilisee` INTEGER NOT NULL DEFAULT 0,
    `commentaire` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `debut_preassemblage_produit_fini_idx`(`produit_fini`),
    INDEX `debut_preassemblage_lot_corps_idx`(`lot_corps`),
    INDEX `debut_preassemblage_date_idx`(`date`),
    PRIMARY KEY (`id_debutpreassemblage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debut_preassemblage_reference` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_debutpreassemblage` VARCHAR(50) NOT NULL,
    `reference_nom` VARCHAR(150) NOT NULL,
    `lot_valeur` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `debut_preassemblage_reference_id_debutpreassemblage_idx`(`id_debutpreassemblage`),
    UNIQUE INDEX `debut_preassemblage_reference_id_debutpreassemblage_referenc_key`(`id_debutpreassemblage`, `reference_nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debut_preassemblage_piece` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_debutpreassemblage` VARCHAR(50) NOT NULL,
    `piece_code` VARCHAR(60) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `debut_preassemblage_piece_id_debutpreassemblage_idx`(`id_debutpreassemblage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_preassemblage` (
    `id_debutpreassemblage` VARCHAR(50) NOT NULL,
    `activite` VARCHAR(50) NOT NULL,
    `produit_fini` VARCHAR(50) NOT NULL,
    `date` DATE NOT NULL,
    `operateur` VARCHAR(20) NOT NULL,
    `commentaire` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_debutpreassemblage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_preassemblage_piece` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_debutpreassemblage` VARCHAR(50) NOT NULL,
    `piece_code` VARCHAR(60) NOT NULL,
    `qc_ok` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_preassemblage_piece_id_debutpreassemblage_idx`(`id_debutpreassemblage`),
    UNIQUE INDEX `fin_preassemblage_piece_id_debutpreassemblage_piece_code_key`(`id_debutpreassemblage`, `piece_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debut_assemblage` (
    `id_debutassemblage` VARCHAR(50) NOT NULL,
    `activite` VARCHAR(50) NOT NULL,
    `produit_fini` VARCHAR(50) NOT NULL,
    `lot_asm` VARCHAR(50) NOT NULL,
    `date` DATE NOT NULL,
    `operateur` VARCHAR(20) NOT NULL,
    `piece_disponible` INTEGER NOT NULL DEFAULT 0,
    `quantite_utilisee` INTEGER NOT NULL DEFAULT 0,
    `commentaire` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `debut_assemblage_produit_fini_idx`(`produit_fini`),
    INDEX `debut_assemblage_lot_asm_idx`(`lot_asm`),
    INDEX `debut_assemblage_date_idx`(`date`),
    PRIMARY KEY (`id_debutassemblage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debut_assemblage_reference` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_debutassemblage` VARCHAR(50) NOT NULL,
    `reference_nom` VARCHAR(150) NOT NULL,
    `lot_valeur` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `debut_assemblage_reference_id_debutassemblage_idx`(`id_debutassemblage`),
    UNIQUE INDEX `debut_assemblage_reference_id_debutassemblage_reference_nom_key`(`id_debutassemblage`, `reference_nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debut_assemblage_piece` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_debutassemblage` VARCHAR(50) NOT NULL,
    `piece_code` VARCHAR(60) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `debut_assemblage_piece_id_debutassemblage_idx`(`id_debutassemblage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_assemblage` (
    `id_finassemblage` VARCHAR(50) NOT NULL,
    `date` DATE NOT NULL,
    `operateur` VARCHAR(20) NOT NULL,
    `commentaire` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_finassemblage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_assemblage_piece` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_finassemblage` VARCHAR(50) NOT NULL,
    `piece_code` VARCHAR(60) NOT NULL,
    `qc_ok` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fin_assemblage_piece_id_finassemblage_idx`(`id_finassemblage`),
    UNIQUE INDEX `fin_assemblage_piece_id_finassemblage_piece_code_key`(`id_finassemblage`, `piece_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_tomo_finis` (
    `id_debuttomo` VARCHAR(50) NOT NULL,
    `activite` VARCHAR(50) NOT NULL,
    `produit_fini` VARCHAR(50) NOT NULL,
    `nb_puces_tomo` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `heure` TIME(0) NOT NULL,
    `operateur` VARCHAR(50) NOT NULL,
    `commentaire` TEXT NULL,

    PRIMARY KEY (`id_debuttomo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `debuthydro_finis_id_debuthydro_idx` ON `debuthydro_finis`(`id_debuthydro`);

-- CreateIndex
CREATE INDEX `debuttomo_finis_id_debuttomo_idx` ON `debuttomo_finis`(`id_debuttomo`);

-- CreateIndex
CREATE INDEX `idx_lot_status_type_step_dispo` ON `lot_status`(`type_piece`, `current_step`, `disponible_finis`);

-- AddForeignKey
ALTER TABLE `cote_piece` ADD CONSTRAINT `cote_piece_piece_id_fkey` FOREIGN KEY (`piece_id`) REFERENCES `piece`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produitfinireference` ADD CONSTRAINT `produitfinireference_produitFiniId_fkey` FOREIGN KEY (`produitFiniId`) REFERENCES `produitfini`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `semifinipreassemblagereference` ADD CONSTRAINT `semifinipreassemblagereference_semiFiniPreAssemblageId_fkey` FOREIGN KEY (`semiFiniPreAssemblageId`) REFERENCES `semifinipreassemblage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debut_preassemblage_reference` ADD CONSTRAINT `debut_preassemblage_reference_id_debutpreassemblage_fkey` FOREIGN KEY (`id_debutpreassemblage`) REFERENCES `debut_preassemblage`(`id_debutpreassemblage`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debut_preassemblage_piece` ADD CONSTRAINT `debut_preassemblage_piece_id_debutpreassemblage_fkey` FOREIGN KEY (`id_debutpreassemblage`) REFERENCES `debut_preassemblage`(`id_debutpreassemblage`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_preassemblage` ADD CONSTRAINT `fin_preassemblage_id_debutpreassemblage_fkey` FOREIGN KEY (`id_debutpreassemblage`) REFERENCES `debut_preassemblage`(`id_debutpreassemblage`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_preassemblage_piece` ADD CONSTRAINT `fin_preassemblage_piece_id_debutpreassemblage_fkey` FOREIGN KEY (`id_debutpreassemblage`) REFERENCES `fin_preassemblage`(`id_debutpreassemblage`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debut_assemblage_reference` ADD CONSTRAINT `debut_assemblage_reference_id_debutassemblage_fkey` FOREIGN KEY (`id_debutassemblage`) REFERENCES `debut_assemblage`(`id_debutassemblage`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debut_assemblage_piece` ADD CONSTRAINT `debut_assemblage_piece_id_debutassemblage_fkey` FOREIGN KEY (`id_debutassemblage`) REFERENCES `debut_assemblage`(`id_debutassemblage`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_assemblage` ADD CONSTRAINT `fin_assemblage_id_finassemblage_fkey` FOREIGN KEY (`id_finassemblage`) REFERENCES `debut_assemblage`(`id_debutassemblage`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_assemblage_piece` ADD CONSTRAINT `fin_assemblage_piece_id_finassemblage_fkey` FOREIGN KEY (`id_finassemblage`) REFERENCES `fin_assemblage`(`id_finassemblage`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `debuthydro_finis_piece` ADD CONSTRAINT `debuthydro_finis_piece_id_debuthydro_fkey` FOREIGN KEY (`id_debuthydro`) REFERENCES `debuthydro_finis`(`id_debuthydro`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_hydro_finis` ADD CONSTRAINT `fin_hydro_finis_id_debuthydro_fkey` FOREIGN KEY (`id_debuthydro`) REFERENCES `debuthydro_finis`(`id_debuthydro`) ON DELETE CASCADE ON UPDATE CASCADE;
