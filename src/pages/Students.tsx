import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdmission } from '../data/admissionContext';
import StatusTag from '../components/StatusTag';

const statusOptions = ['All', 'Applied', 'Under Review', 'Selected', 'Rejected', 'Waitlisted'];
const boardOptions = ['All', 'State Board', 'CBSE', 'ICSE', 'Other'];

export default function Students() {
  const { students, departments, removeStudent } = useAdmission();
  const [statusFilter, setStatusFilter] = useState('All');
  const [boardFilter, setBoardFilter] = useState('All');
  const [search, setSearch] = useState('');

  const displayStudents = useMemo(() => {
    return students.filter((student) => {
      if (statusFilter !== 'All' && student.admissionStatus !== statusFilter) return false;
      if (boardFilter !== 'All' && student.boardType !== boardFilter) return false;
      if (search && !student.studentName.toLowerCase().includes(search.toLowerCase()) && !student.applicationId.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [students, statusFilter, boardFilter, search]);

  return (
    <div>
      <div className="card title-card">
        <div>
          <h1>Student Details</h1>
          <p style={{ color: '#94a3b8' }}>Manage student profiles, view application progress and identify top performers.</p>
        </div>
        <Link to="/student/new" className="button-primary">Add Student</Link>
      </div>

      <div className="section">
        <div className="filters">
          <input placeholder="Search student or application ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={boardFilter} onChange={(e) => setBoardFilter(e.target.value)}>
            {boardOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <div className="card section table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Application ID</th>
              <th>Name</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>District</th>
              <th>School</th>
              <th>Board</th>
              <th>Community</th>
              <th>Cutoff</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.applicationId}</td>
                <td>{student.studentName}</td>
                <td>{student.gender}</td>
                <td>{student.dob}</td>
                <td>{student.mobile}</td>
                <td>{student.email}</td>
                <td>{student.district}</td>
                <td>{student.schoolName}</td>
                <td>{student.boardType}</td>
                <td>{student.community}</td>
                <td>{student.cutoffMark}</td>
                <td>{departments.find((dept) => dept.id === student.departmentId)?.departmentName || 'Unknown'}</td>
                <td><StatusTag status={student.admissionStatus} /></td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <Link className="button-secondary" to={`/student/edit/${student.id}`}>Edit</Link>
                  <button className="button-secondary" onClick={async () => {
                    try {
                      await removeStudent(student.id);
                    } catch (error) {
                      console.error('Failed to delete student:', error);
                    }
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
