FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy go.mod và go.sum để tận dụng cache
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build ứng dụng
RUN CGO_ENABLED=0 GOOS=linux go build -o userservice ./cmd/main.go

# Final stage
FROM alpine:latest

WORKDIR /app

# Cài đặt ca-certificates để HTTPS requests
RUN apk --no-cache add ca-certificates

# Copy binary từ builder stage
COPY --from=builder /app/userservice .
COPY .env .env

# Tạo thư mục và quyền cần thiết
RUN mkdir -p /app/uploads && \
    chmod -R 755 /app

# Expose ports
EXPOSE 8081 50051

# Khởi chạy ứng dụng
CMD ["./userservice"] 