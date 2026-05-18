import { useState } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);

  const allowedLinks = links.filter(link => user && link.roles.includes(user.role));

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button type="button" className="sidebar-menu-button" onClick={() => setIsOpen((prev) => !prev)} aria-label="Toggle navigation menu">
        ⋮
      </button>

      <div className="sidebar-panel">
        <div className="sidebar-panel-header">
          <div>
            <h2>College Admission</h2>
            <p>Track applications, review departments and manage admissions with simplicity.</p>
          </div>
          <button type="button" className="sidebar-close-button" onClick={() => setIsOpen(false)} aria-label="Close menu">×</button>
        </div>

        {user && (
          <div className="sidebar-user-card">
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
              Logged in as <strong>{user.username}</strong><br />
              Role: {user.role}
            </p>
          </div>
        )}

        <nav className="sidebar-links">
          {allowedLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setIsOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-actions">
          <h3>Quick actions</h3>
          {user?.role !== 'faculty' && (
            <>
              <NavLink to="/student/new" className="nav-link" onClick={() => setIsOpen(false)}>New Student</NavLink>
              {user?.role === 'admin' && <NavLink to="/department/new" className="nav-link" onClick={() => setIsOpen(false)}>New Department</NavLink>}
            </>
          )}
          <button onClick={logout} className="nav-link logout-link" type="button">
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
