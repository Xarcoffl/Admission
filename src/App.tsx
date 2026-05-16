import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Students from './pages/Students';
import Departments from './pages/Departments';
import Insights from './pages/Insights';
import StudentForm from './pages/StudentForm';
import DepartmentForm from './pages/DepartmentForm';
import Login from './pages/Login';
import { AdmissionProvider, useAdmission } from './data/admissionContext';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user } = useAdmission();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/overview" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user } = useAdmission();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate replace to="/overview" />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/students" element={
            <ProtectedRoute allowedRoles={['admin', 'officer']}>
              <Students />
            </ProtectedRoute>
          } />
          <Route path="/departments" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Departments />
            </ProtectedRoute>
          } />
          <Route path="/insights" element={<Insights />} />
          <Route path="/student/new" element={
            <ProtectedRoute allowedRoles={['admin', 'officer']}>
              <StudentForm />
            </ProtectedRoute>
          } />
          <Route path="/student/edit/:id" element={
            <ProtectedRoute allowedRoles={['admin', 'officer']}>
              <StudentForm />
            </ProtectedRoute>
          } />
          <Route path="/department/new" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DepartmentForm />
            </ProtectedRoute>
          } />
          <Route path="/department/edit/:id" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DepartmentForm />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AdmissionProvider>
      <AppContent />
    </AdmissionProvider>
  );
}

export default App;
