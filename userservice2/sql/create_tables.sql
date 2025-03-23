-- Bảng quốc gia
CREATE TABLE countries (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL,
    phone_code VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng tỉnh/thành phố
CREATE TABLE provinces (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    country_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code),
    INDEX idx_country_id (country_id),
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng quận/huyện
CREATE TABLE districts (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    province_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code),
    INDEX idx_province_id (province_id),
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng người dùng
CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    full_name VARCHAR(100) NOT NULL,
    bio TEXT,
    location VARCHAR(100),
    country_id INT,
    province_id INT,
    district_id INT,
    website VARCHAR(255),
    profile_picture_url VARCHAR(255),
    cover_picture_url VARCHAR(255),
    date_of_birth DATE,
    work VARCHAR(100),
    education VARCHAR(100),
    relationship VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_country (country_id),
    INDEX idx_province (province_id),
    INDEX idx_district (district_id),
    FOREIGN KEY (country_id) REFERENCES countries(id),
    FOREIGN KEY (province_id) REFERENCES provinces(id),
    FOREIGN KEY (district_id) REFERENCES districts(id)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng quản lý mối quan hệ bạn bè
CREATE TABLE friendships (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    status ENUM('none', 'pending', 'accepted', 'rejected', 'blocked') NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_friendship (user_id, friend_id),
    INDEX idx_user_id (user_id),
    INDEX idx_friend_id (friend_id),
    INDEX idx_status (status)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng nhóm (sửa tên thành user_groups để tránh từ khóa)
CREATE TABLE user_groups (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    privacy ENUM('public', 'private') NOT NULL DEFAULT 'public',
    cover_image VARCHAR(255),
    created_by BIGINT NOT NULL,
    member_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by),
    INDEX idx_privacy (privacy)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng thành viên nhóm
CREATE TABLE group_members (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role ENUM('member', 'admin') NOT NULL DEFAULT 'member',
    nickname VARCHAR(50),
    is_muted BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME NULL,
    FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_member (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng yêu cầu tham gia nhóm
CREATE TABLE group_join_requests (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    message TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_join_request (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng cho các chức vụ đặc biệt trong nhóm
CREATE TABLE group_roles (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    group_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    permissions JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES user_groups(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_name (group_id, name),
    INDEX idx_group_id (group_id)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng gán chức vụ trong nhóm cho thành viên
CREATE TABLE group_member_roles (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    group_member_id BIGINT NOT NULL,
    group_role_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_member_id) REFERENCES group_members(id) ON DELETE CASCADE,
    FOREIGN KEY (group_role_id) REFERENCES group_roles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_member_role (group_member_id, group_role_id)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Trigger để cập nhật số lượng thành viên khi thêm thành viên nhóm
DELIMITER //
CREATE TRIGGER update_member_count_after_insert
AFTER INSERT ON group_members
FOR EACH ROW
BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE user_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    END IF;
END//
DELIMITER ;

-- Trigger để cập nhật số lượng thành viên khi cập nhật trạng thái thành viên
DELIMITER //
CREATE TRIGGER update_member_count_after_update
AFTER UPDATE ON group_members
FOR EACH ROW
BEGIN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
        UPDATE user_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
    ELSEIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
        UPDATE user_groups SET member_count = member_count - 1 WHERE id = NEW.group_id;
    END IF;
END//
DELIMITER ;

-- Trigger để cập nhật số lượng thành viên khi xóa thành viên
DELIMITER //
CREATE TRIGGER update_member_count_after_delete
AFTER DELETE ON group_members
FOR EACH ROW
BEGIN
    IF OLD.status = 'approved' THEN
        UPDATE user_groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
    END IF;
END//
DELIMITER ;

-- Trigger để tự động thêm vào group_members khi yêu cầu được chấp nhận
DELIMITER //
CREATE TRIGGER auto_add_member_after_request_approval
AFTER UPDATE ON group_join_requests
FOR EACH ROW
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
        INSERT INTO group_members (group_id, user_id, role, status)
        VALUES (NEW.group_id, NEW.user_id, 'member', 'approved')
        ON DUPLICATE KEY UPDATE status = 'approved';
    END IF;
END//
DELIMITER ; 