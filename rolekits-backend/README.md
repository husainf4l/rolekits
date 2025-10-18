# RoleKits Backend

A NestJS-based backend for the RoleKits application, featuring GraphQL API, TypeORM for database management, and JWT authentication.

## Features

- 🚀 **NestJS Framework** - Progressive Node.js framework
- 🔐 **JWT Authentication** - Secure user authentication
- 📊 **GraphQL API** - Modern API with Apollo Server
- 💾 **TypeORM** - PostgreSQL database integration
- 🔄 **Real-time Subscriptions** - WebSocket support for live updates
- ✅ **Validation** - Request validation with class-validator
- 🎯 **TypeScript** - Fully typed codebase

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **API**: GraphQL (Apollo Server)
- **Authentication**: JWT with Passport
- **Validation**: class-validator & class-transformer

## Project Setup

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=rolekits

# JWT
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRATION=30m

# Application
PORT=8003
NODE_ENV=development
```

## Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be running at:
- **GraphQL Playground**: http://localhost:8003/graphql
- **API Endpoint**: http://localhost:8003/graphql

## GraphQL API

### Authentication

#### Sign Up
```graphql
mutation Signup {
  signup(input: { username: "john", password: "password123" }) {
    id
    username
  }
}
```

#### Login
```graphql
mutation Login {
  login(input: { username: "john", password: "password123" }) {
    accessToken
    tokenType
  }
}
```

### CV Management

#### Create CV
```graphql
mutation CreateCV {
  createCV(input: {
    fullName: "John Doe"
    email: "john@example.com"
    phone: "+1234567890"
    summary: "Experienced software developer"
    skills: ["TypeScript", "NestJS", "GraphQL"]
  }) {
    id
    fullName
    email
  }
}
```

#### Get My CVs
```graphql
query MyCVs {
  myCvs {
    id
    fullName
    email
    createdAt
    updatedAt
  }
}
```

#### Get Specific CV
```graphql
query GetCV {
  cv(cvId: 1) {
    id
    fullName
    email
    phone
    summary
    skills
    experience {
      company
      position
      startDate
      endDate
    }
  }
}
```

#### Update CV
```graphql
mutation UpdateCV {
  updateCV(cvId: 1, input: {
    fullName: "John Updated"
    summary: "Updated summary"
  }) {
    id
    fullName
    updatedAt
  }
}
```

#### Delete CV
```graphql
mutation DeleteCV {
  deleteCV(cvId: 1)
}
```

### Real-time Subscriptions

```graphql
subscription CVUpdates {
  cvUpdates(cvId: 1) {
    id
    fullName
    email
    updatedAt
  }
}
```

## Project Structure

```
src/
├── auth/                   # Authentication module
│   ├── dto/               # Data transfer objects
│   ├── auth.service.ts    # Auth business logic
│   ├── auth.resolver.ts   # GraphQL resolver
│   ├── auth.module.ts     # Auth module
│   ├── jwt.strategy.ts    # JWT strategy
│   └── gql-auth.guard.ts  # GraphQL auth guard
├── users/                  # Users module
│   ├── entities/          # User entity
│   ├── users.service.ts   # User service
│   ├── users.resolver.ts  # User resolver
│   └── users.module.ts    # Users module
├── cv/                     # CV module
│   ├── entities/          # CV entity
│   ├── dto/               # CV DTOs
│   ├── cv.service.ts      # CV service
│   ├── cv.resolver.ts     # CV resolver
│   └── cv.module.ts       # CV module
├── common/                 # Shared utilities
│   └── decorators/        # Custom decorators
├── config/                 # Configuration files
│   └── database.config.ts # Database configuration
├── app.module.ts          # Root module
└── main.ts                # Application entry point
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database

The application uses TypeORM with PostgreSQL. Database schema is automatically synchronized in development mode.

### Entities

- **User**: User accounts with authentication
- **CV**: Resume/CV information with complex nested data

## Authentication

All CV-related queries and mutations require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Development

```bash
# Build the application
npm run build

# Format code
npm run format

# Lint code
npm run lint
```

## Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Disable TypeORM `synchronize` option
3. Set up database migrations
4. Use strong JWT secret
5. Configure CORS for specific origins
6. Enable HTTPS
7. Set up monitoring and logging

## License

MIT

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [GraphQL Documentation](https://graphql.org)
- [TypeORM Documentation](https://typeorm.io)

