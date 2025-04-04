FROM eclipse-temurin:21-jdk-alpine as builder

WORKDIR /app

# Sao chép các tệp Gradle và source để tận dụng Docker cache tốt hơn
COPY gradle/ gradle/
COPY build.gradle settings.gradle ./
COPY gradlew ./
RUN chmod +x ./gradlew
# Tải dependencies trước, tận dụng cache khi source code thay đổi
RUN ./gradlew dependencies --no-daemon

# Sao chép mã nguồn 
COPY src/ src/

# Biên dịch và đóng gói ứng dụng
RUN ./gradlew bootJar --no-daemon

# Sử dụng hình ảnh nhỏ gọn cho giai đoạn chạy
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Cài đặt công cụ cần thiết
RUN apk add --no-cache curl

# Sao chép tệp JAR từ giai đoạn builder
COPY --from=builder /app/build/libs/*.jar app.jar

# Tạo .env file từ biến môi trường
ENV DB_HOST=hoanhao.cn2qakqoyq4d.ap-southeast-1.rds.amazonaws.com \
    DB_PORT=3306 \
    DB_NAME=hoanhao_auth \
    DB_USERNAME=admin \
    DB_PASSWORD=ga123456. \
    JWT_SECRET=mysecretkeyforhs256whichislongenough \
    SERVER_PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod

# Mở cổng cho ứng dụng
EXPOSE 8080

# Bỏ health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
#   CMD curl -f http://localhost:8080/actuator/health || exit 1

# Chạy ứng dụng với cấu hình tối ưu
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.address=0.0.0.0", "-Dspring.profiles.active=prod", "-jar", "app.jar"] 