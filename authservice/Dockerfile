FROM eclipse-temurin:21-jre-alpine as builder

WORKDIR /app

# Sao chép các tệp Gradle
COPY gradle/ gradle/
COPY gradlew build.gradle settings.gradle ./

# Sao chép mã nguồn
COPY src/ src/

# Cấp quyền thực thi cho gradlew
RUN chmod +x ./gradlew

# Biên dịch và đóng gói ứng dụng
RUN ./gradlew bootJar --no-daemon

# Sử dụng hình ảnh nhỏ gọn cho giai đoạn chạy
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Sao chép tệp JAR từ giai đoạn builder
COPY --from=builder /app/build/libs/*.jar app.jar

# Sao chép tệp .env nếu có
COPY .env ./.env

# Môi trường mặc định
ENV DB_HOST=hoanhao.cn2qakqoyq4d.ap-southeast-1.rds.amazonaws.com
ENV DB_PORT=3306
ENV DB_NAME=hoanhao_auth
ENV DB_USERNAME=admin
ENV DB_PASSWORD=ga123456.
ENV JWT_SECRET=mysecretkeyforhs256whichislongenough
ENV SERVER_PORT=8080

# Mở cổng cho ứng dụng
EXPOSE 8080

# Chạy ứng dụng với cấu hình tối ưu
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"] 