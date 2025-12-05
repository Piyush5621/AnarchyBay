# BitShelf Backend

The backend service for BitShelf, a platform for discovering and exploring trending digital content.

## Overview

This is an Express.js server that provides authentication and user management capabilities using Supabase as the authentication provider.

## Tech Stack

- **Framework**: Express.js
- **Authentication**: Supabase
- **Environment Management**: dotenv
- **CORS**: Enabled for frontend integration
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm or npm
- Supabase project credentials

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file in the backend directory with the following variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anonymous_key
FRONTEND_URL=http://localhost:5173
PORT=3000
```

3. Start the development server:
```bash
pnpm dev
```

The server will be running at `http://localhost:3000`

## Project Structure

```
src/
├── server.js                 # Main server entry point
├── controllers/
│   └── auth.controller.js   # Authentication request handlers
├── routes/
│   └── auth.route.js        # Authentication routes
├── services/
│   └── auth.service.js      # Authentication business logic
└── lib/
    └── supabase.js          # Supabase client configuration
```

## API Endpoints

### Authentication Routes (`/auth`)

#### Sign Up
- **Endpoint**: `POST /auth/signup`
- **Description**: Create a new user account
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```
- **Response**: 
  - Success (201): User data with access token
  - Error (400): Validation errors or existing user

#### Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and get session token
- **Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```
- **Response**: 
  - Success (200): User data with access token
  - Error (401): Invalid credentials

#### Get Current User
- **Endpoint**: `GET /auth/me`
- **Description**: Retrieve current authenticated user information
- **Headers**: 
```
Authorization: Bearer <access_token>
```
- **Response**: 
  - Success (200): Current user data
  - Error (401): Missing or invalid token

#### Logout
- **Endpoint**: `POST /auth/logout`
- **Description**: End user session (client-side handling)
- **Response**: 
  - Success (200): Confirmation message

### Health Check
- **Endpoint**: `GET /health-check`
- **Description**: Server status check
- **Response**: "Hello, World!"

## Architecture

### Controllers (`controllers/auth.controller.js`)
Handles incoming HTTP requests, validates input, and orchestrates the flow between routes and services.

### Services (`services/auth.service.js`)
Contains the business logic for authentication operations, interfacing with Supabase.

### Supabase Integration (`lib/supabase.js`)
- Initializes the Supabase client
- Provides error handling utility for consistent error responses

### Error Handling
The application uses a centralized error handler (`handleSupabaseError`) that returns consistent error responses with appropriate HTTP status codes.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Required |
| `SUPABASE_ANON_KEY` | Supabase anonymous API key | Required |
| `FRONTEND_URL` | Frontend application URL for CORS | `http://localhost:5173` |
| `PORT` | Server port | `3000` |

## CORS Configuration

The server is configured to accept requests from the frontend origin specified in the `FRONTEND_URL` environment variable. Allowed methods:
- GET
- POST
- PUT
- DELETE

Credentials are enabled for secure cookie-based sessions.

## Development

### Running the Server
```bash
pnpm dev
```

### Viewing Logs
All errors and important operations are logged to the console for debugging purposes.

## Contributing

When contributing to the authentication system:
1. Follow the existing project structure
2. Add proper error handling for all edge cases
3. Include console logs for debugging
4. Test all endpoints thoroughly with the frontend

## Issues & Debugging

- **Import Path Error**: The controller imports from `../lib/supabaseClient.js` but the actual file is `../lib/supabase.js`. This needs to be fixed.
- **Token Validation**: Ensure the Bearer token format is strictly validated
- **CORS Issues**: Verify `FRONTEND_URL` matches your frontend development server

## Future Enhancements

- [ ] Add password reset functionality
- [ ] Implement refresh token rotation
- [ ] Add email verification
- [ ] Implement rate limiting for auth endpoints
- [ ] Add comprehensive logging/monitoring
