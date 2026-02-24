-- Add activity + type_pieces to debut_tomo
ALTER TABLE `debut_tomo`
  ADD COLUMN `activity` VARCHAR(50) NULL AFTER `id_lot`,
  ADD COLUMN `type_pieces` VARCHAR(50) NULL AFTER `activity`;
