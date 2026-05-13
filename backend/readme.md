# Hyra AI Backend

## Yêu cầu hệ thống

### Java Development Kit (JDK)
- **Khuyến nghị**: JDK 21 (dự án được build mặc định với Java 21)
- **Tối thiểu**: JDK 17 (có profile hỗ trợ trong pom.xml)
- **Kiểm tra version**: `java -version`

### Maven
- **Version**: 3.6 trở lên
- **Kiểm tra version**: `mvn -version`

### MySQL
- **Version**: 8.0 trở lên
- **Port**: 3306 (mặc định)

## Cài đặt và chạy

### 1. Cấu hình database
Tạo database MySQL:
```sql
CREATE DATABASE hyra_ai;
-- Lưu ý: Application mặc định sử dụng user 'root' và password 'root'
```

### 2. Cấu hình application
Mặc định project sử dụng thông tin trong `src/main/resources/application.yaml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/hyra_ai?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: root
```

*Nếu bạn có thông tin đăng nhập database khác, vui lòng cấu hình lại file yaml này hoặc set biến môi trường tương ứng.*

### 3. Chạy ứng dụng
```bash
# Chạy trực tiếp bằng Maven
mvn spring-boot:run

# Hoặc build và chạy JAR
mvn clean package
java -jar target/backend-0.0.1.jar
```

## API Endpoints Overview

**Lưu ý quan trọng**: Server có `context-path: /hyra_ai`. Nghĩa là base URL của tất cả các API khi chạy local sẽ là:
`http://localhost:8080/hyra_ai`

Chi tiết các tham số, payload và định dạng response chuẩn có thể xem tại thư mục `docs/` (`docs/api-overview.md` và `docs/api-endpoints.json`).

### Authentication (`/auth`)
- `POST /auth/token` - Đăng nhập bằng Email/Password
- `POST /auth/google` - Đăng nhập qua Google
- `POST /auth/introspect` - Kiểm tra tính hợp lệ của token
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Đăng xuất
- `POST /auth/send-otp` - Gửi mã OTP xác nhận (lưu ý: cần truyền query param `?email=...&mode=...`)
- `POST /auth/verify-otp` - Xác nhận mã OTP
- `POST /auth/reset-password` - Đặt lại mật khẩu (khi quên)
- `POST /auth/set-password-google` - Đặt mật khẩu cho tài khoản Google lần đầu
- `GET /auth/check-google-user` - Kiểm tra email có liên kết Google không (lưu ý: cần truyền query param `?email=...`)
- `POST /auth/change-password` - Đổi mật khẩu tài khoản (cần gửi kèm Header Authorization token)

### User Management (`/users`)
- `POST /users` - Đăng ký user mới (Khách hàng)
- `POST /users/staff` - Tạo tài khoản Staff (cần quyền hệ thống)
- `GET /users` - Lấy danh sách users
- `GET /users/my-info` - Lấy thông tin user hiện tại đang đăng nhập
- `GET /users/{userId}` - Lấy thông tin chi tiết một user
- `PUT /users/{userId}` - Cập nhật thông tin user
- `DELETE /users/{userId}` - Xóa user
- `GET /users/roles` - Lấy danh sách các vai trò (roles) hiện có của module user

### Role Management (`/roles`)
- `POST /roles` - Tạo vai trò mới
- `GET /roles` - Lấy danh sách vai trò
- `DELETE /roles/{role}` - Xóa một vai trò

### Permission Management (`/permissions`)
- `POST /permissions` - Tạo quyền (permission) mới
- `GET /permissions` - Lấy danh sách quyền
- `DELETE /permissions/{permission}` - Xóa một quyền

## Troubleshooting & Development

### Lỗi JDK version
Nếu gặp lỗi về JDK version khi chạy:
```bash
# Kiểm tra JAVA_HOME
echo $JAVA_HOME

# Set JAVA_HOME cho JDK 21 hoặc 17
export JAVA_HOME=/path/to/jdk21
```

### Chạy tests
```bash
mvn test
```

## Docker Guideline

Build Docker image:
```bash
docker build -t hyra-ai-backend:latest .
```

Tạo network và chạy MySQL container:
```bash
docker network create hyra-network
docker run --network hyra-network --name mysql-db -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=hyra_ai -d mysql:8.0.43-debian
```

Chạy backend app:
```bash
docker run --name hyra-backend --network hyra-network -p 8080:8080 -e spring.datasource.url=jdbc:mysql://mysql-db:3306/hyra_ai -e spring.datasource.username=root -e spring.datasource.password=root hyra-ai-backend:latest
```