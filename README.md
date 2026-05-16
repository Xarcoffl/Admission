# College Admission Analytics Dashboard

A full-stack React + Express.js web application for college admission management with authentication and role-based access.

## Features
- **Frontend**: Clean React dashboard with charts and data visualization
- **Backend**: Express.js API with JWT authentication
- **Authentication**: Role-based access control (Admin, Officer, Faculty)
- **Data Management**: CRUD operations for students and departments
- **Real-time Updates**: Live data synchronization between frontend and backend

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Recharts
- **Backend**: Node.js, Express.js, TypeScript, JWT
- **Styling**: Custom CSS with dark theme

## Setup

### Backend
```bash
cd backend
npm install
npm run dev  # Development server on port 3001
```

### Frontend
```bash
cd /Volumes/Xarc/Admission  # Root directory
npm install
npm run dev  # Development server on port 4173
```

## Demo Accounts
- **Admin**: admin / admin123 (Full access)
- **Officer**: officer / officer123 (Student management)
- **Faculty**: faculty / faculty123 (View-only)

## API Documentation
See `backend/README.md` for detailed API endpoints and usage.

## Pages
- **Login**: Authentication page
- **Executive Overview**: KPI cards and charts for all users
- **Student Analytics**: Student management (Admin/Officer only)
- **Department Analytics**: Department management (Admin only)
- **Admission Insights**: Performance metrics and trends

## Security
- JWT token-based authentication
- Role-based route protection
- Rate limiting on API endpoints
- CORS enabled for frontend-backend communication
