package com.hoanhao.authservice.repository;

import com.hoanhao.authservice.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    // Bạn có thể thêm các truy vấn tùy chỉnh nếu cần
}
