-- CreateTable
CREATE TABLE `activites` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `activites_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assemblage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity` VARCHAR(255) NOT NULL,
    `quantite` INTEGER NULL,
    `id_nozzle` VARCHAR(25) NULL,
    `id_body` VARCHAR(25) NULL,
    `date` DATE NOT NULL,
    `operateur` VARCHAR(10) NOT NULL,
    `commentaire` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cote_piece` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `piece_id` INTEGER NULL,
    `nom_cote` VARCHAR(255) NULL,
    `tolerance_min` INTEGER NULL,
    `tolerance_max` INTEGER NULL,

    INDEX `piece_id`(`piece_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debuttomo_finis` (
    `id` VARCHAR(50) NOT NULL,
    `nb_pieces` INTEGER NOT NULL,
    `etage` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `heure_debut` TIME(0) NOT NULL,
    `operateur` VARCHAR(50) NOT NULL,
    `num_machine` VARCHAR(50) NOT NULL,
    `version` VARCHAR(25) NOT NULL,
    `separation` VARCHAR(25) NOT NULL,
    `commentaire` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debut_etching` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_lot` INTEGER NOT NULL,
    `num_lot_wafer` VARCHAR(50) NULL,
    `nb_pieces` INTEGER NULL,
    `operateur` VARCHAR(50) NULL,
    `nb_passage` INTEGER NULL,
    `date_debut` DATE NULL,
    `heure_debut` TIME(0) NULL,
    `temps_reel` INTEGER NULL,
    `koh` VARCHAR(50) NULL,
    `bain` VARCHAR(50) NULL,
    `position` INTEGER NULL,
    `commentaire` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `debut_tomo` (
    `id_lot` VARCHAR(50) NOT NULL,
    `nb_pieces` INTEGER NOT NULL,
    `etage` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `heure_debut` TIME(0) NOT NULL,
    `operateur` VARCHAR(50) NOT NULL,
    `num_machine` VARCHAR(50) NOT NULL,
    `version` VARCHAR(25) NOT NULL,
    `separation` VARCHAR(25) NOT NULL,
    `commentaire` TEXT NULL,

    PRIMARY KEY (`id_lot`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `denomination_options` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fintomo_finis` (
    `id` VARCHAR(50) NOT NULL,
    `quantite` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `heure` TIME(0) NOT NULL,
    `operateur` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_etching` (
    `id_lot` INTEGER NOT NULL AUTO_INCREMENT,
    `num_lot_wafer` VARCHAR(50) NOT NULL,
    `nb_passage` INTEGER NOT NULL,
    `date_fin` DATE NOT NULL,
    `heure_fin` TIME(0) NOT NULL,
    `nb_piece_conforme` INTEGER NOT NULL,
    `operateur` VARCHAR(100) NOT NULL,
    `commentaire` TEXT NULL,

    PRIMARY KEY (`id_lot`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_impression` (
    `id_lot` INTEGER NOT NULL,
    `num_lot_wafer` VARCHAR(50) NULL,
    `nb_lancees` INTEGER NULL,
    `nb_imprimees` INTEGER NULL,
    `operateur` VARCHAR(100) NULL,
    `date_fin` DATE NULL,
    `commentaires` TEXT NULL,

    PRIMARY KEY (`id_lot`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fin_tomo` (
    `id_lot` INTEGER NOT NULL,
    `quantite` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `heure` TIME(0) NOT NULL,
    `operateur` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_lot`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imprimantes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `imprimantes_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lot_status` (
    `id_lot` VARCHAR(100) NOT NULL,
    `nb_pieces` INTEGER NULL,
    `current_step` VARCHAR(100) NULL,
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `activity` VARCHAR(25) NULL,
    `type_piece` VARCHAR(100) NOT NULL,
    `revision` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id_lot`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mesure_cote_piece` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_piece_locale` VARCHAR(100) NOT NULL,
    `id_cote_piece` INTEGER NOT NULL,
    `valeur` INTEGER NOT NULL,
    `id_lot` INTEGER NOT NULL,
    `nb_passage` INTEGER NOT NULL,

    INDEX `id_cote_piece`(`id_cote_piece`),
    INDEX `fk_mesure_prise`(`id_lot`, `nb_passage`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nc_pieces` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_lot` VARCHAR(50) NOT NULL,
    `id_piece` VARCHAR(50) NOT NULL,
    `operateur` VARCHAR(100) NULL,
    `date` DATE NULL,
    `denomination` VARCHAR(100) NULL,
    `produit` VARCHAR(100) NULL,
    `type_de_production` VARCHAR(100) NULL,
    `type` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `decision` TEXT NULL,
    `cause_racine` TEXT NULL,
    `statut` VARCHAR(50) NULL DEFAULT 'Non traité',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `justification` TEXT NULL,
    `lien` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nouvelle_impression` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `activity` VARCHAR(50) NULL,
    `type_pieces` VARCHAR(50) NULL,
    `version_piece` VARCHAR(10) NULL,
    `num_lot_wafer` VARCHAR(255) NULL,
    `nb_pieces` INTEGER NULL,
    `imprimante` VARCHAR(50) NULL,
    `date_impression` DATE NULL,
    `operateur` VARCHAR(50) NULL,
    `commentaire` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `piece` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `nb_cotes` INTEGER NOT NULL,

    UNIQUE INDEX `piece_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prise_de_cotes` (
    `id_lot` INTEGER NOT NULL,
    `nb_passage` INTEGER NOT NULL,
    `type_piece` VARCHAR(100) NULL,
    `nombre_pieces` INTEGER NULL,
    `date` DATE NULL,

    PRIMARY KEY (`id_lot`, `nb_passage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `prenom` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `version_piece` (
    `version` VARCHAR(50) NOT NULL,
    `nom_piece` VARCHAR(255) NULL,

    PRIMARY KEY (`version`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
