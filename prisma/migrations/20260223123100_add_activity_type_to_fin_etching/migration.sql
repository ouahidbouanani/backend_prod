-- Add activity + type_pieces to fin_etching
ALTER TABLE `fin_etching`
  ADD COLUMN `activity` VARCHAR(50) NULL AFTER `id_lot`,
  ADD COLUMN `type_pieces` VARCHAR(50) NULL AFTER `activity`;
