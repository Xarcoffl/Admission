# College Admissions Backend API

Express.js API server with TypeScript for the College Admissions Dashboard.

## Features
- JWT authentication with role-based access
- RESTful API for students and departments
- In-memory data store (for demo purposes)
- Rate limiting and CORS support

## Setup
1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Start server: `npm start` (production) or `npm run dev` (development)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password

### Students (requires auth)
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create student (admin/officer)
- `PUT /api/students/:id` - Update student (admin/officer)
- `DELETE /api/students/:id` - Delete student (admin only)

### Departments (requires auth)
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create department (admin only)
- `PUT /api/departments/:id` - Update department (admin only)
- `DELETE /api/departments/:id` - Delete department (admin only)

## Roles
- **admin**: Full access to all features
- **officer**: Can manage students, view insights
- **faculty**: View-only access to overview and insights

## Demo Users
- admin / admin123
- officer / officer123
- faculty / faculty123
