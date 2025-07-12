-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `card_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `card_system`;

-- 创建用户表（通过Sequelize自动创建）

-- 添加触发器
DELIMITER //

-- 更新卡密状态触发器（每当检查到过期时自动更新状态）
CREATE TRIGGER IF NOT EXISTS `check_card_expiry`
BEFORE UPDATE ON `cards`
FOR EACH ROW
BEGIN
    IF NEW.status = 'used' AND NEW.expiresAt IS NOT NULL AND NEW.expiresAt < NOW() THEN
        SET NEW.status = 'expired';
    END IF;
END //

DELIMITER ;

-- 创建索引（根据需要添加，这些是常用索引）
CREATE INDEX IF NOT EXISTS `idx_cards_cardCode` ON `cards` (`cardCode`);
CREATE INDEX IF NOT EXISTS `idx_cards_status` ON `cards` (`status`);
CREATE INDEX IF NOT EXISTS `idx_cards_expiresAt` ON `cards` (`expiresAt`);
CREATE INDEX IF NOT EXISTS `idx_cards_userId` ON `cards` (`userId`);
CREATE INDEX IF NOT EXISTS `idx_users_username` ON `users` (`username`);
CREATE INDEX IF NOT EXISTS `idx_contents_status` ON `contents` (`status`);

-- 添加初始管理员（可以通过init-db.js添加，此处为备用）
-- 密码: admin123
-- INSERT INTO `users` (`username`, `password`, `email`, `role`, `status`, `createdAt`, `updatedAt`)
-- VALUES ('admin', '$2a$10$bwZXKCdgK0kSYm6pCYA3e.cvvUruC4QBQ2Uc.h.KVEqI0dwNXAJnK', 'admin@example.com', 'super', 'active', NOW(), NOW()); 