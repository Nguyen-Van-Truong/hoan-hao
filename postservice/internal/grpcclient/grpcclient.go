package grpcclient

import (
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"log"
	pb "postservice/proto"
	"time"
)

var (
	UserServiceClient pb.UserServiceClient
	conn              *grpc.ClientConn // Lưu trữ kết nối để đóng sau
)

func InitUserServiceClient(address string) {
	var err error
	conn, err = grpc.Dial(
		address,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithTimeout(5*time.Second),
	)
	if err != nil {
		log.Fatalf("Failed to connect to UserService: %v", err)
	}
	UserServiceClient = pb.NewUserServiceClient(conn)
}

func Close() {
	if conn != nil {
		if err := conn.Close(); err != nil {
			log.Printf("Failed to close gRPC connection: %v", err)
		} else {
			log.Println("gRPC connection closed")
		}
	}
}
