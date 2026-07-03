You are an expert systems analyst tasked with producing a comprehensive Software Requirements Specification (SRS) document for the Training and Placement Cell (TPC) Internship Management System. Use the information provided in the CLAUDE.md file and the source code exploration (routes, controllers, models, frontend pages) to detail the system's functional and non-functional requirements, user roles and their permitted actions, system interfaces, and any other relevant SRS sections.

The SRS should include at least the following sections:

1. Introduction
   - Purpose of the document
   - Scope of the system
   - Definitions, acronyms, and abbreviations
   - References
   - Overview

2. Overall Description
   - Product perspective
   - Product functions
   - User classes and characteristics (Admin, Moderator, Trainer, User/Student)
   - Operating environment
   - Design and implementation constraints
   - Assumptions and dependencies

3. Specific Requirements
   - Functional Requirements (detailed by module: Authentication, College Management, Course Management, Student Management, Session Management, Schedule Management, Attendance Management, Contract Management, Dashboard/Statistics, Moderation, etc.)
   - Non-functional Requirements (Performance, Security, Safety, Portability, Maintainability, etc.)
   - Database requirements (MongoDB/Mongoose schema notes)
   - Interface requirements (API endpoints, frontend-backend communication, authentication mechanism)

4. User Roles and Permissions
   - For each role (Admin, Moderator, Trainer, User), list the specific actions they are allowed to perform (Create, Read, Update, Delete) on each entity (College, Course, Student, Session, Schedule, Attendance, Contract, Dashboard, etc.) based on the explored backend middleware and route definitions.
   - Highlight any restrictions (e.g., Moderators limited to their own college, Trainers limited to attendance operations, etc.)

5. System Architecture
   - Summary of frontend (React + Vite, CSS modules, localStorage for JWT) and backend (Node.js + Express, MongoDB via Mongoose, JWT authentication, role-based authorization) technologies.
   - Deployment via Docker Compose (MongoDB, backend, frontend, Nginx).
   - Communication: Frontend accesses backend API at http://localhost:5000/api with JWT Bearer token.

6. Other Requirements (if applicable)

Ensure the SRS is clear, concise, and suitable for use by developers, testers, and stakeholders. Base all statements on the provided source code and documentation; do not introduce assumptions not supported by the source material.

---
Source Summary (for your reference):

From CLAUDE.md:
- Frontend: React 19 with Vite, localStorage for JWT (tpctoken, tpcuser), CSS modules, login page at src/pages/login/LabdingPage.jsx (component LandingPage).
- Backend: Node.js/Express, MongoDB/Mongoose, JWT auth with role-based access (user, admin, moderator, trainer). Default admin credentials: admin@tpc.com / admin.
- Role-Based Access Updates:
   * College moderators now have full CRUD access to courses, students, sessions, schedules, but only for their own college.
   - Dashboard statistics endpoint (/api/dashboard/stats) expects collegeId query parameter; moderators restricted to their own college.
- Docker: MongoDB (mongo:6.0), backend (Node alpine) on port 5000, frontend (Nginx) on port 80, custom network mern-network.
- Important notes: Backend expects email for login, CORS enabled globally, frontend API base URL hardcoded to http://localhost:5000/api.

From backend routes and controllers (summary):
- Auth: POST /api/auth/login returns token and user {name, email, role}.
- Colleges: CRUD only for admin (authorized via authorizeRoles('admin')).
- Courses: CRUD for admin and moderator (authorizeRoles('admin','moderator')).
- Students: CRUD for admin and moderator.
- Sessions: CRUD for admin and moderator.
- Schedules: CRUD for admin and moderator; also GET /upcoming (admin/moderator).
- Attendance:
   * Trainers: POST / (create), PUT / (update), GET /upcoming-classes.
   * Moderators: GET /analytics.
   * Admin & Moderator: GET /chart, GET /distribution, GET /college/:collegeId/session/:sessionId.
- Contracts: (assume similar to other entities; need to check but not provided; assume admin/moderator?)
- Trainers: CRUD? (need to check trainers.js)
- Moderators: CRUD? (moderators.js)
- Dashboard: GET /stats (admin/moderator) with collegeId query; middleware forces moderator to their own college.
- Middleware: verifyToken (JWT), authorizeRoles(...allowedRoles) returns 403 if role not allowed.

From frontend pages (brief):
- Admin portal includes navigation to Dashboard, College, Trainer, Contracts, Sessions, Schedules, Attendance.
- Moderator likely sees same navigation but restricted by backend.
- Trainer likely sees limited options (maybe attendance).
- User likely only sees login page.

Thus, craft the SRS accordingly.