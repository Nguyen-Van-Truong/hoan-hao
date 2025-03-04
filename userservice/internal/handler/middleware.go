package handler

import (
	"log"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

// JWTMiddleware trích xuất userId từ token JWT nếu có
func JWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next() // Tiếp tục xử lý nếu không có token
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			log.Printf("Invalid Authorization header format")
			c.Next() // Tiếp tục thay vì Abort
			return
		}

		// Parse token mà không verify (vì Kong đã làm điều này)
		token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
		if err != nil {
			log.Printf("Invalid token format: %v", err)
			c.Next() // Tiếp tục thay vì Abort
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			userID, ok := claims["userId"]
			if !ok {
				log.Printf("User ID not found in token")
				c.Next()
				return
			}

			var id uint
			switch v := userID.(type) {
			case float64:
				id = uint(v)
			case int64:
				id = uint(v)
			case uint:
				id = v
			default:
				log.Printf("Invalid user ID type in token: %v", userID)
				c.Next()
				return
			}

			if id == 0 {
				log.Printf("Invalid user ID value")
				c.Next()
				return
			}

			c.Set("userId", id)
		} else {
			log.Printf("Invalid token claims")
		}

		c.Next()
	}
}
