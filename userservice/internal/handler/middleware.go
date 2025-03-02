// userservice/internal/handler/middleware.go
package handler

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

// JWTMiddleware trích xuất userId từ token JWT
func JWTMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header missing"})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Authorization header format"})
			c.Abort()
			return
		}

		// Parse token mà không verify (vì Kong đã làm điều này)
		token, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			userID, ok := claims["userId"]
			if !ok {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
				c.Abort()
				return
			}

			// Xử lý userId có thể là float64 hoặc int
			var id uint
			switch v := userID.(type) {
			case float64:
				id = uint(v)
			case int64:
				id = uint(v)
			case uint:
				id = v
			default:
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID type in token"})
				c.Abort()
				return
			}

			if id == 0 {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID value"})
				c.Abort()
				return
			}

			c.Set("userId", id)
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		c.Next()
	}
}
