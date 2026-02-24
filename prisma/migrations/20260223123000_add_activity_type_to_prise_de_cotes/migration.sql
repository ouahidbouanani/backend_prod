-- Add activity + type_pieces to prise_de_cotes
ALTER TABLE `prise_de_cotes`
  ADD COLUMN `activity` VARCHAR(50) NULL AFTER `nb_passage`,
  ADD COLUMN `type_pieces` VARCHAR(100) NULL AFTER `activity`;
