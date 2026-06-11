# TPC Internship Project

This project consists of a frontend and a backend application.

## Backend API

The backend is a Node.js/Express application connected to a MongoDB database. It provides authentication and role-based access control.

### Base URL

Assuming the backend runs on `http://localhost:5000` (or the port set by the `BACKEND_PORT` environment variable).

### Endpoints

#### Public Endpoints

| Method | Endpoint | Description | Request Body | Success Response |
|--------|----------|-------------|--------------|------------------|
| GET | `/` | Health check to verify the API is running. | None | `200 OK`: `{ "message": "TPC Backend API is running" }` |
| POST | `/api/auth/login` | Authenticate a user and return a JWT token along with user details. | `{ "email": "string", "password": "string" }` | `200 OK`:<br>`{`<br>`  "token": "jwt-token",`<br>`  "user": {`<br>`    "name": "string",`<br>`    "email": "string",`<br>`    "role": "string" (one of 'user', 'admin', 'moderator')`<br>`  }`<br>`}`<br>`400 Bad Request`: `{ "message": "Invalid Credentials" }` (if email not found or password incorrect)<br>`500 Internal Server Error`: `{ "message": "Server error" }` |

#### Protected Endpoints (Require Authentication)

All protected endpoints require a valid JWT token in the `Authorization` header as `Bearer <token>`.

| Method | Endpoint | Description | Required Role(s) | Success Response |
|--------|----------|-------------|------------------|------------------|
| GET | `/api/admin/dashboard` | Admin dashboard endpoint. | `admin` | `200 OK`: `{ "message": "Welcome to the Admin Dashboard!" }`<br>`401 Unauthorized`: If token is missing or invalid.<br>`403 Forbidden`: If the authenticated user does not have the required role. |
| GET | `/api/admin/content` | Content moderation endpoint. | `admin` or `moderator` | `200 OK`: `{ "message": "Moderate content here." }`<br>`401 Unauthorized`: If token is missing or invalid.<br>`403 Forbidden`: If the authenticated user does not have the required role. |

### Authentication Details

- Upon successful login, the client receives a JWT token that must be stored (e.g., in localStorage) and sent with each subsequent request to protected endpoints in the `Authorization` header.
- The token is signed with a secret key (set via `JWT_SECRET` environment variable) and expires in 1 day.
- The token payload includes the user's `_id` and `role`.

### Role Hierarchy

- `user`: Default role for registered users (only accessible via login, no specific endpoints defined in this backend).
- `moderator`: Can access the `/api/admin/content` endpoint.
- `admin`: Can access both `/api/admin/dashboard` and `/api/admin/content`.

### Database Seeding

On startup, the backend seeds a default admin user if one does not already exist. The credentials are:
- Email: `admin@tpc.com` (or set via `ADMIN_EMAIL` environment variable)
- Password: `admin` (or set via `ADMIN_PASSWORD` environment variable)
- Role: `admin`

## Frontend

The frontend is a separate application (located in the `frontend` directory) that consumes this API. Refer to the frontend's README for details on how to run and use it.

## Setup and Running

Refer to the `compose.yml` for Docker-based setup or check the individual backend and frontend directories for instructions on running the applications locally.
