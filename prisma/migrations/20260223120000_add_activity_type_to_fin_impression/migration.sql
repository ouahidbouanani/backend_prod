-- Add activity + type_pieces to fin_impression
ALTER TABLE `fin_impression`
  ADD COLUMN `activity` VARCHAR(50) NULL AFTER `id_lot`,
  ADD COLUMN `type_pieces` VARCHAR(50) NULL AFTER `activity`;
