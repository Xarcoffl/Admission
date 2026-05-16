import { NavLink } from 'react-router-dom';
import { useAdmission } from '../data/admissionContext';

const links = [
  { to: '/overview', label: 'Executive Overview', roles: ['admin', 'officer', 'faculty'] },
  { to: '/students', label: 'Student Analytics', roles: ['admin', 'officer'] },
  { to: '/departments', label: 'Department Analytics', roles: ['admin'] },
  { to: '/insights', label: 'Admission Insights', roles: ['admin', 'officer', 'faculty'] }
];

export default function Sidebar() {
  const { user, logout } = useAdmission();

  const allowedLinks = links.filter(link => user && link.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: 28 }}>
        <h2>College Admission</h2>
        <p style={{ color: '#94a3b8', marginTop: 6, lineHeight: 1.5 }}>Track applications, review departments and manage admissions with simplicity.</p>
        {user && (
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(79, 139, 255, 0.1)', borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
              Logged in as <strong>{user.username}</strong><br />
              Role: {user.role}
            </p>
          </div>
        )}
      </div>
      {allowedLinks.map((link) => (
        <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          {link.label}
        </NavLink>
      ))}
      <div style={{ marginTop: 32 }}>
        <h2>Quick actions</h2>
        {user?.role !== 'faculty' && (
          <>
            <NavLink to="/student/new" className="nav-link">New Student</NavLink>
            {user?.role === 'admin' && <NavLink to="/department/new" className="nav-link">New Department</NavLink>}
          </>
        )}
        <button onClick={logout} className="nav-link" style={{ border: 'none', background: 'transparent', color: '#cbd5e1', cursor: 'pointer', width: '100%', textAlign: 'left', padding: '12px 16px' }}>
          Logout
        </button>
      </div>
    </aside>
  );
}
