-- AddForeignKey
ALTER TABLE `cote_piece` ADD CONSTRAINT `cote_piece_piece_id_fkey` FOREIGN KEY (`piece_id`) REFERENCES `piece`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
