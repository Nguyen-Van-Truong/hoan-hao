# 🌟 Hoàn Hảo - Social Networking Platform with Microservices Architecture

> [🇻🇳 Phiên bản tiếng Việt/Vietnamese version](README.vi.md)

<p align="center">
  <img src="fe-hoan-hao/public/logointab.png" alt="Hoàn Hảo Logo" width="200" />
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#microservices-architecture">Architecture</a> •
  <a href="#key-features">Features</a> •
  <a href="#technology-stack">Technology</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-endpoints">API</a> •
  <a href="#contact-and-contributions">Contribute</a>
</p>

## 📋 Overview

**Hoàn Hảo** is a modern social networking platform developed with a microservices architecture, providing comprehensive features for social interaction, user profile management, and content posting. This project applies the most advanced technologies and methodologies in modern software development, with a roadmap for developing additional advanced features.

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Golang%20%7C%20Spring%20Boot-blue" alt="Backend" />
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript-brightgreen" alt="Frontend" />
  <img src="https://img.shields.io/badge/Database-MySQL-orange" alt="Database" />
  <img src="https://img.shields.io/badge/API%20Gateway-Kong-red" alt="API Gateway" />
  <img src="https://img.shields.io/badge/Deployment-Docker-informational" alt="Deployment" />
</p>

## 🏗️ Microservices Architecture

```
┌─────────────┐     
│   Browser   │     
│   Client    │     
└──────┬──────┘     
        │           
        │           
        │           
        ▼           
┌─────────────────────────────────┐
│                                 │
│       Kong API Gateway          │
│  (JWT Auth, Routing, Security)  │
│                                 │
└───────┬───────────┬─────────────┘
        │           │           │
        │           │           │
        ▼           ▼           ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│                 │ │                 │ │                 │
│   AuthService   │ │   UserService   │ │   PostService   │
│  (Spring Boot)  │ │  (Golang/Gin)   │ │  (Golang/Gin)   │
│                 │ │                 │ │                 │
└─────────┬───────┘ └─────────┬───────┘ └─────────┬───────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│                 │ │                 │ │                 │
│  Auth Database  │ │  User Database  │ │  Post Database  │
│     (MySQL)     │ │     (MySQL)     │ │     (MySQL)     │
│                 │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 🌐 Kong API Gateway [✓ Implemented]
- **Language/Technology**: Kong Gateway, Docker
- **Function**: Single entry point for all API requests, handling authentication and routing to appropriate microservices.
- **Main Features**:
  - ✅ Smart routing based on paths and HTTP methods
  - ✅ Centralized JWT authentication
  - ✅ System-wide CORS management
  - ✅ Rate limiting and API protection
  - ✅ Centralized logging

### 🔐 AuthService [✓ Implemented]
- **Language/Technology**: Spring Boot, Spring Security, MySQL, JWT
- **Function**: Manages the entire user authentication process and security
- **Main Features**:
  - ✅ Registration, login, and session management
  - ✅ Issuing and refreshing JWT tokens
  - ✅ Forgot password and password reset via email
  - ✅ Password change and login information management
  - 🔜 Two-factor authentication (2FA) [In Development]
  - 🔜 OAuth2 integration (Google, Facebook) [In Development]

### 👥 UserService [✓ Partially Implemented]
- **Language/Technology**: Golang (Gin framework), MySQL
- **Function**: Manages user information and friend relationships
- **Main Features**:
  - ✅ User profile management (personal info, avatar, cover)
  - ✅ Basic friend system (friend requests, unfriending, blocking)
  - ✅ User search
  - 🔜 Group creation and management with permissions [In Development]
  - 🔜 Smart friend suggestions [In Development]
  - 🔜 Caching with Redis for fast queries [Planned]

### 📝 PostService [✓ Implemented]
- **Language/Technology**: Golang (Gin framework), MySQL
- **Function**: Handles all user-generated content (posts, comments, reactions)
- **Main Features**:
  - ✅ Full CRUD for posts with privacy permissions
  - ✅ Comment system with replies
  - ✅ Likes/reactions functionality
  - ✅ Post sharing
  - ✅ Media upload and management (images)
  - 🔜 Personalized newsfeed algorithm [In Development]

### 💻 Frontend [✓ Implemented]
- **Language/Technology**: React, TypeScript, Vite, Tailwind CSS
- **Function**: Modern user interface and smooth experience
- **Main Features**:
  - ✅ Modern UI/UX with Tailwind and Shadcn UI
  - ✅ Responsive design for all devices
  - ✅ Efficient state management
  - 🔜 WebSocket integration for real-time messages and notifications [Planned]
  - 🔜 Lazy loading and code splitting for optimized performance [In Development]
  - 🔜 Multilingual support (i18n) [Planned]

### 📱 Features In Development
- **💬 Chat Service**: Real-time messaging system with WebSocket
- **🎮 Game Service**: Integrated gaming platform for users
- **🔔 Notification Service**: Real-time notification system

## ✨ Key Features

### 🔐 Authentication & Security [✓ Implemented]
- ✅ Complete user authentication flow (Login, Register, Forgot Password)
- ✅ Route and API protection for authenticated users
- ✅ Centralized JWT authentication via Kong Gateway
- 🔜 Session locking after multiple failed login attempts [In Development]
- 🔜 OAuth2 authentication with Google and Facebook [In Development]

### 🌐 Social Interaction [✓ Partially Implemented]
- ✅ Post creation with media support (images)
- ✅ Basic comment and reaction system
- ✅ Customizable user profiles
- 🔜 Newsfeed with personalized algorithm [In Development]
- 🔜 Friend suggestions based on network [In Development]

### 👨‍👩‍👧‍👦 Groups & Communities [🔜 In Development]
- 🔜 Create and join groups with privacy options
- 🔜 Group management (settings, members, group rules)
- 🔜 Group discussions
- 🔜 Admin and moderator permissions

### 💬 Messaging & Communication [🔜 Planned]
- 🔜 Private messaging
- 🔜 Group chat and conversation management
- 🔜 Media and file sharing

### 🎮 Games & Entertainment [🔜 Planned]
- 🔜 Integrated gaming platform
- 🔜 Multiple game types (casual, multiplayer)
- 🔜 Leaderboards
- 🔜 Integration with friend system for multiplayer

## 🚀 Technology Stack

### Backend
- **Kong Gateway**: API Gateway, authentication and routing
- **Spring Boot**: Authentication service, JWT management with Spring Security
- **Golang (Gin)**: Lightweight and high-performance microservices
- **MySQL**: Primary database for each microservice
- **Docker**: Containerization and deployment
- 🔜 **Redis**: Caching and messaging support [Planned]
- 🔜 **gRPC**: Efficient communication between microservices [Planned]

### Frontend
- **React**: Modern UI library with Hooks
- **TypeScript**: Typed JavaScript for safer development
- **Vite**: Super-fast build tool and hot module replacement
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Highly customizable UI components
- 🔜 **Redux Toolkit**: State management with simplified syntax [Planned]
- 🔜 **React Query**: Data fetching and caching [Planned]
- 🔜 **Socket.io Client**: WebSockets for real-time communication [Planned]

## 🔧 Getting Started

### Requirements
- Docker and Docker Compose
- Node.js (v16 or higher)
- Go 1.16+
- JDK 17+
- MySQL 5.7+

### Installation & Running

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/hoan-hao.git
cd hoan-hao
```

#### 2. Start the Entire System with Docker Compose
```bash
# Set up the entire system with one command
docker-compose up -d
```

#### 3. Or Start Each Service Separately

**Kong Gateway**:
```bash
cd kong
docker-compose up -d
./setup-kong.ps1 # or ./setup-kong.sh on Linux/Mac
```

**AuthService**:
```bash
cd authservice
./gradlew bootRun
# Or with Docker
docker build -t authservice .
docker run -p 8080:8080 authservice
```

**UserService**:
```bash
cd userservice2
go run cmd/main.go
# Or with Docker
docker build -t userservice .
docker run -p 8081:8081 userservice
```

**PostService**:
```bash
cd postservice
go run cmd/server/main.go
# Or with Docker
docker build -t postservice .
docker run -p 8082:8082 postservice
```

**Frontend**:
```bash
cd fe-hoan-hao
npm install
npm run dev
# Build for production
npm run build
```

## 📘 API Endpoints

### 🔐 Auth API
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Log in and receive a JWT token
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/change-password` - Change password

### 👤 User API
- `GET /users/me` - Get personal information (JWT protected)
- `PUT /users/me` - Update personal information
- `GET /users/:id` - Get user information by ID
- `GET /users/search` - Search for users

### 👥 Friends API
- `GET /users/friends` - Get friends list
- `GET /users/friends/suggestions` - Get friend suggestions
- `GET /users/friends/requests` - Get friend requests
- `POST /users/friends/request/:userId` - Send friend request
- `PUT /users/friends/accept/:userId` - Accept friend request
- `DELETE /users/friends/:userId` - Unfriend
- `POST /users/friends/block/:userId` - Block user

### 📝 Post API
- `GET /post` - Get list of posts
- `POST /post` - Create a new post (JWT protected)
- `GET /post/:uuid` - Get post by UUID
- `PUT /post/:uuid` - Update post
- `DELETE /post/:uuid` - Delete post
- `POST /post/:uuid/like` - Like post
- `DELETE /post/:uuid/like` - Unlike post
- `GET /post/:uuid/comments` - Get post comments
- `POST /post/:uuid/comment` - Add comment
- `GET /post/user/:userId/posts` - Get posts by user

## 🔮 Development Roadmap

Hoàn Hảo is actively being developed with the following roadmap:

### Phase 1: Core Foundation ✓ [Completed]
- ✅ User authentication
- ✅ User profile management
- ✅ Post management and basic interactions
- ✅ API Gateway and security

### Phase 2: Advanced Social Features 🔄 [In Progress]
- 🔄 Group and community features
- 🔄 Improved newsfeed algorithm
- 🔄 Smart friend suggestions
- 🔄 Advanced integrations and performance optimization

### Phase 3: Feature Expansion 📅 [Q3 2023]
- 📅 Real-time messaging system
- 📅 Real-time notifications
- 📅 Multilingual support
- 📅 OAuth2 integration

### Phase 4: Enhanced User Experience 📅 [Q4 2023]
- 📅 Gaming platform
- 📅 Enhanced personalization capabilities
- 📅 Streaming integration
- 📅 Mobile app with React Native

## 🤝 Contact and Contributions

The Hoàn Hảo project is developed by a team of professional developers and always welcomes contributions from the community!

### Contribution Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add: amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request with a detailed description

### Coding Standards
- Adhere to code style rules for each language
- Write unit tests for new code
- Ensure all CI checks pass
- Update documentation as necessary

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

We'd like to express our gratitude to all the open-source libraries and tools that have helped make Hoàn Hảo a reality. Special thanks to:

- [Kong](https://konghq.com/) for API Gateway
- [Spring Boot](https://spring.io/projects/spring-boot) for AuthService
- [Golang](https://golang.org/) and [Gin](https://gin-gonic.com/) for microservices
- [React](https://reactjs.org/) and [Tailwind CSS](https://tailwindcss.com/) for frontend
- [Docker](https://www.docker.com/) for container deployment