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
SELLER_SECRET=your_secure_seller_secret
```

3. Start the development server:
```bash
pnpm dev
```

The server will be running at `http://localhost:3000`

## Project Structure

```
src/
├── server.js                  # Main server entry point
├── controllers/
│   ├── auth.controller.js    # Authentication request handlers
│   └── profile.controller.js # User profile request handlers
├── routes/
│   ├── auth.route.js         # Authentication routes
│   └── profile.route.js      # Profile management routes
├── services/
│   ├── auth.service.js       # Authentication business logic
│   └── profile.service.js    # Profile management business logic
└── lib/
    └── supabase.js           # Supabase client configuration
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Sign Up
- **Endpoint**: `POST /api/auth/signup`
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
- **Endpoint**: `POST /api/auth/login`
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
- **Endpoint**: `GET /api/auth/me`
- **Description**: Retrieve current authenticated user information
- **Headers**: 
```
Authorization: Bearer <access_token>
```
- **Response**: 
  - Success (200): Current user data
  - Error (401): Missing or invalid token

#### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Description**: End user session (client-side handling)
- **Response**: 
  - Success (200): Confirmation message

### Profile Routes (`/api/profile`)

#### Create User Profile
- **Endpoint**: `POST /api/profile/create-user-profile`
- **Description**: Create a user profile with role validation
- **Request Body**:
```json
{
  "id": "user_id_from_auth",
  "name": "John Doe",
  "email": "user@example.com",
  "role": "customer",
  "sellerCode": "optional_seller_secret"
}
```
- **Response**: 
  - Success (201): Created profile data
  - Error (400): Missing required fields
  - Error (403): Invalid seller code (if role is "seller")

#### Get User Profile
- **Endpoint**: `POST /api/profile/get-user-profile`
- **Description**: Retrieve user profile by user ID
- **Request Body**:
```json
{
  "userId": "user_id"
}
```
- **Response**: 
  - Success (200): User profile with name and role
  - Error (400): Missing user ID

#### Get Total Users
- **Endpoint**: `GET /api/profile/get-total-users`
- **Description**: Get count of all registered users
- **Response**: 
  - Success (200): Array of all profiles with count metadata

### Health Check
- **Endpoint**: `GET /health-check`
- **Description**: Server status check
- **Response**: "Hello, World!"

## Architecture

### Controllers
- **`auth.controller.js`**: Handles authentication HTTP requests, validates input, and orchestrates auth flow
- **`profile.controller.js`**: Manages user profile operations including role-based access control for seller accounts

### Services
- **`auth.service.js`**: Business logic for authentication operations, interfacing with Supabase Auth
- **`profile.service.js`**: Business logic for profile management, interfacing with Supabase database

### Supabase Integration (`lib/supabase.js`)
- Initializes the Supabase client
- Provides error handling utility for consistent error responses
- Validates environment variables on startup

### Error Handling
The application uses a centralized error handler (`handleSupabaseError`) that returns consistent error responses with appropriate HTTP status codes.

### Role-Based Access
- **Customer**: Default role for regular users
- **Seller**: Requires a valid seller secret code during profile creation
- Server-side validation ensures role integrity

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | Required |
| `SUPABASE_ANON_KEY` | Supabase anonymous API key | Required |
| `FRONTEND_URL` | Frontend application URL for CORS | `http://localhost:5173` |
| `PORT` | Server port | `3000` |
| `SELLER_SECRET` | Secret code for seller registration | Required |

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

- **Token Validation**: Ensure the Bearer token format is strictly validated
- **CORS Issues**: Verify `FRONTEND_URL` matches your frontend development server
- **Seller Secret**: Keep `SELLER_SECRET` secure and don't commit it to version control
- **Database Schema**: Ensure the `profiles` table exists in Supabase with columns: `id`, `name`, `email`, `role`

## Future Enhancements

- [ ] Add password reset functionality
- [ ] Implement refresh token rotation
- [ ] Add email verification
- [ ] Implement rate limiting for auth endpoints
- [ ] Add comprehensive logging/monitoring
- [ ] Add authentication middleware for protected routes
- [ ] Implement profile update/delete endpoints
- [ ] Add role-based access control middleware
