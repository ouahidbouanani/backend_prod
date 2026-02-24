-- CreateTable
CREATE TABLE `debuthydro_finis` (
  `id_debuthydro` VARCHAR(50) NOT NULL,
  `activite` VARCHAR(50) NOT NULL,
  `produit_fini` VARCHAR(50) NOT NULL,
  `piece_disponible` INTEGER NOT NULL,
  `quantite_utilisee` INTEGER NOT NULL,
  `date` DATE NOT NULL,
  `operateur` VARCHAR(50) NOT NULL,
  `commentaire` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id_debuthydro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debuthydro_finis_piece` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `id_debuthydro` VARCHAR(50) NOT NULL,
  `piece_code` VARCHAR(60) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE INDEX `debuthydro_finis_piece_id_debuthydro_piece_code_key` (`id_debuthydro`, `piece_code`),
  INDEX `debuthydro_finis_piece_id_debuthydro_idx` (`id_debuthydro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_hydro_finis` (
  `id_debuthydro` VARCHAR(50) NOT NULL,
  `activite` VARCHAR(50) NOT NULL,
  `produit_fini` VARCHAR(50) NOT NULL,
  `quantite_utilisee` INTEGER NOT NULL,
  `date` DATE NOT NULL,
  `operateur` VARCHAR(50) NOT NULL,
  `commentaire` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id_debuthydro`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `debuthydro_finis_piece`
  ADD CONSTRAINT `debuthydro_finis_piece_id_debuthydro_fkey`
  FOREIGN KEY (`id_debuthydro`) REFERENCES `debuthydro_finis`(`id_debuthydro`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fin_hydro_finis`
  ADD CONSTRAINT `fin_hydro_finis_id_debuthydro_fkey`
  FOREIGN KEY (`id_debuthydro`) REFERENCES `debuthydro_finis`(`id_debuthydro`)
  ON DELETE CASCADE ON UPDATE CASCADE;
