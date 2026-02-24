-- Add activity + type_pieces to fin_tomo
ALTER TABLE `fin_tomo`
  ADD COLUMN `activity` VARCHAR(50) NULL AFTER `id_lot`,
  ADD COLUMN `type_pieces` VARCHAR(50) NULL AFTER `activity`;
