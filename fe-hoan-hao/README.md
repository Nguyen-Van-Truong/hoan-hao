# Hoàn Hảo - Social Networking Platform

<p align="center">
  <img src="public/logointab.png" alt="Hoàn Hảo Logo" width="200" />
</p>

## Overview

Hoàn Hảo is a modern social networking platform built with React, TypeScript, and Tailwind CSS. It provides a comprehensive suite of features for social interaction, group management, messaging, and gaming.

## Features

### Authentication
- Complete user authentication flow (Login, Register, Forgot Password, Reset Password)
- Protected routes for authenticated users

### Social Interaction
- News feed with photo gallery posts
- Post creation with rich media support
- Comments and reactions
- User profiles with customization options

### Groups
- Create and join groups
- Public and private group options
- Group management (settings, members, rules)
- Group events and discussions
- Admin and moderator controls

### Messaging
- Real-time private messaging
- Conversation management
- Media sharing capabilities

### Gaming
- Integrated game platform
- Multiple game types (browser, embedded, desktop)
- Game status tracking
- Leaderboards

### Additional Features
- Friend suggestions
- Search functionality
- Responsive design for all devices
- Multi-language support

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI components
- **Routing**: React Router
- **Form Handling**: React Hook Form, Zod
- **UI Components**: Radix UI
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── auth/         # Authentication components
│   ├── games/        # Game-related components
│   ├── layout/       # Layout components
│   ├── messages/     # Messaging components
│   ├── navigation/   # Navigation components
│   ├── post/         # Post-related components
│   ├── profile/      # Profile components
│   ├── search/       # Search components
│   ├── sidebar/      # Sidebar components
│   └── ui/           # Shadcn UI components
├── contexts/         # React contexts
├── data/             # Mock data
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── pages/            # Application pages
└── types/            # TypeScript type definitions
```

## Key Pages

- **Home**: Main feed with posts and sidebar content
- **Profile**: User profile with posts and information
- **Messages**: Private messaging interface
- **Groups**: Group discovery, creation, and management
- **Games**: Game discovery and gameplay

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hoan-hao

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
# or
yarn build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide Icons](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the fast development experience
