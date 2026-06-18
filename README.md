# TPC Internship Project

A full-stack MERN (MongoDB, Express, React, Node.js) application with role-based access control (admin, moderator, user) and JWT authentication.

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running with Docker Compose](#running-with-docker-compose)
  - [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Important Notes](#important-notes)

## Overview
This project consists of two main applications:
1. **Backend**: A Node.js/Express server connected to MongoDB, providing RESTful APIs for authentication and protected routes.
2. **Frontend**: A React application built with Vite, consuming the backend APIs and providing a user interface for login and admin/dashboard views.

## Technology Stack
### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Middleware**: CORS, dotenv
- **Development**: Nodemon for auto-restart

### Frontend
- **Library**: React 19
- **Build Tool**: Vite
- **Styling**: CSS modules
- **State Management**: Local React state (useState, useEffect) with JWT stored in localStorage

## Project Structure
```
TPC-internship/
├── backend/
│   ├── src/ (or root contains server.js, routes, controllers, etc.)
│   ├── package.json
│   ├── Dockerfile
│   └── ... (other backend files)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   │   └── LabdingPage.jsx (note: filename typo, component is LandingPage)
│   │   │   ├── admin/
│   │   │   └── sidebar/
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.js
├── compose.yml
├── CLAUDE.md
├── .gitignore
└README.md
```

## Setup and Installation

### Prerequisites
- Docker and Docker Compose (for containerized setup)
- OR Node.js (v18+), npm, and MongoDB (for local setup)

### Environment Variables
The backend requires a `.env` file in the `backend/` directory. Create it with the following variables (see `compose.yml` for example values):

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-db
JWT_SECRET=your-super-secret-jwt-token-change-this-in-production
ADMIN_EMAIL=admin@tpc.com
ADMIN_PASSWORD=admin
```

### Running with Docker Compose (Recommended)
1. Ensure Docker is installed and running.
2. From the project root:
   ```bash
   docker compose up --build
   ```
3. The application will be available at:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017 (exposed for debugging if needed)

4. To run in detached mode:
   ```bash
   docker compose up -d
   ```

5. To stop and remove containers:
   ```bash
   docker compose down
   ```

### Running Locally
#### Backend
1. Navigate to the `backend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (as described above).
4. Start the server:
   ```bash
   # Development mode with nodemon
   npm run dev
   ```
   Or production mode:
   ```bash
   npm start
   ```

#### Frontend
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The frontend will be available at http://localhost:5173 (proxy to backend is not configured in Vite dev server; ensure backend is running on port 5000 and adjust API calls if needed).

## API Endpoints

### Base URL
`http://localhost:5000/api` (adjust for Docker/proxy if needed)

#### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/auth/login` | Authenticate user and return JWT |

#### Protected Endpoints (Require Authorization Header: `Bearer <token>`)
| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/api/admin/dashboard` | Admin dashboard | `admin` |
| GET | `/api/admin/content` | Content moderation | `admin` or `moderator` |

### Authentication
- Login via `/api/auth/login` with email and password.
- On success, receive a JWT token valid for 1 day.
- Store the token (e.g., in localStorage) and include it in the `Authorization` header for protected requests.

### Role Hierarchy
- `user`: Default role (no specific endpoints in this backend).
- `moderator`: Access to `/api/admin/content`.
- `admin`: Access to both `/api/admin/dashboard` and `/api/admin/content`.

### Database Seeding
On startup, the backend creates a default admin user if none exists:
- Email: `admin@tpc.com` (or `ADMIN_EMAIL` env var)
- Password: `admin` (or `ADMIN_PASSWORD` env var)
- Role: `admin`

## Important Notes
- The backend expects email for login (not username).
- Default admin credentials (if not set via environment): 
  - Email: `admin@tpc.com`
  - Password: `admin`
- CORS is enabled globally in the backend.
- The frontend login form implements real API calls to `/api/auth/login` and displays user name/role on success.
- **Filename Note**: The frontend login page component is in `src/pages/login/LabdingPage.jsx` (note the typo in the filename: "Labding" instead of "Landing"), but the exported component is named `LandingPage`.
- Always check `.gitignore` for files excluded from version control (e.g., `node_modules`, `dist`, `.env`).
- For local development without Docker, ensure MongoDB is running and accessible at the URI specified in `.env`.

## Troubleshooting
- If the frontend cannot connect to the backend in local development, verify the backend is running on port 5000 and that the API calls in the frontend are using the correct base URL (currently hardcoded to `http://localhost:5000/api` in some service files).
- Docker Compose sets up a custom network (`mern-network`) for inter-service communication; the frontend and backend services refer to each other by service name (`backend` and `frontend`) within this network.