FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go.mod và go.sum để tận dụng cache
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build ứng dụng
RUN CGO_ENABLED=0 GOOS=linux go build -o postservice ./cmd/main.go

# Final stage
FROM alpine:latest

WORKDIR /app

# Cài đặt ca-certificates cho HTTPS requests
RUN apk --no-cache add ca-certificates

# Copy binary từ builder stage
COPY --from=builder /app/postservice .
COPY .env .env

# Expose port
EXPOSE 8082

# Khởi chạy ứng dụng
CMD ["./postservice"] 