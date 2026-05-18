import { useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAdmission } from '../data/admissionContext';
import { Student } from '../data/mockData';
import StatusTag from '../components/StatusTag';

const statusOptions = ['All', 'Applied', 'Under Review', 'Selected', 'Rejected', 'Waitlisted'];
const boardOptions = ['All', 'State Board', 'CBSE', 'ICSE', 'Other'];
const quotaOptions = ['All', 'Management Quota', 'Counselling Quota'];

export default function Students() {
  const { students, departments, removeStudent, addStudent, updateStudent, refreshData } = useAdmission();
  const [statusFilter, setStatusFilter] = useState('All');
  const [boardFilter, setBoardFilter] = useState('All');
  const [quotaFilter, setQuotaFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'applicationId' | 'studentName' | 'cutoffMark' | 'admissionStatus'>('applicationId');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      if (statusFilter !== 'All' && student.admissionStatus !== statusFilter) return false;
      if (boardFilter !== 'All' && student.boardType !== boardFilter) return false;
      if (quotaFilter !== 'All' && student.quota !== quotaFilter) return false;
      if (search && !student.studentName.toLowerCase().includes(search.toLowerCase()) && !student.applicationId.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }

      const textA = String(valueA).toLowerCase();
      const textB = String(valueB).toLowerCase();
      if (textA < textB) return sortOrder === 'asc' ? -1 : 1;
      if (textA > textB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [students, statusFilter, boardFilter, quotaFilter, search, sortField, sortOrder]);

  const generateCSVContent = (data: Student[]) => {
    const headers = ['applicationId', 'studentName', 'gender', 'dob', 'mobile', 'email', 'district', 'schoolName', 'boardType', 'community', 'quota', 'cutoffMark', 'departmentId', 'admissionStatus', 'applicationDate', 'id'];
    const csvHeaders = headers.join(',');
    const csvRows = data.map(student =>
      headers.map(header => {
        const value = student[header as keyof Student];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    return [csvHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = () => {
    const csv = generateCSVContent(displayStudents);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setStatusFilter('All');
    setBoardFilter('All');
    setQuotaFilter('All');
    setSearch('');
  };

  const toggleSort = (field: 'applicationId' | 'studentName' | 'cutoffMark' | 'admissionStatus') => {
    if (sortField === field) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const detailCount = displayStudents.length;
  const selectedCount = displayStudents.filter((student) => student.admissionStatus === 'Selected').length;
  const averageCutoff = displayStudents.length ? (displayStudents.reduce((sum, student) => sum + student.cutoffMark, 0) / displayStudents.length).toFixed(1) : '0.0';
  const weekNew = displayStudents.filter((student) => new Date(student.applicationDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

  const updateSelectedStatus = async (status: Student['admissionStatus']) => {
    if (!selectedStudent) return;
    const updated = await updateStudent({ ...selectedStudent, admissionStatus: status });
    if (updated) {
      setSelectedStudent(updated);
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const parseRow = (row: string) => {
      const matches = row.match(/("([^"]|"")*"|[^,\n]+)/g) || [];
      return matches.map((cell) => cell.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
    };

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = (e.target?.result as string)?.trim();
        if (!csv) return;

        const lines = csv.split('\n').map((line) => line.trim()).filter(Boolean);
        if (lines.length < 2) {
          alert('CSV file is empty or missing data rows.');
          return;
        }

        const headers = parseRow(lines[0]).map((h) => h.trim());
        const headerMap: Record<string, number> = {};
        headers.forEach((header, index) => {
          headerMap[header] = index;
        });

        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const values = parseRow(lines[i]);
          if (values.length < 3) continue;

          const departmentIdFromName = values[headerMap['departmentName']] && departments.find((dept) => dept.departmentName.toLowerCase() === values[headerMap['departmentName']].toLowerCase())?.id;
          const departmentId = values[headerMap['departmentId']] || departmentIdFromName || departments[0]?.id || '';

          const studentData: Student = {
            id: crypto.randomUUID?.() || `student_${Date.now()}_${i}`,
            applicationId: values[headerMap['applicationId']] || `APP-${Date.now()}`,
            studentName: values[headerMap['studentName']] || 'Unknown',
            gender: (values[headerMap['gender']] || 'Male') as 'Male' | 'Female' | 'Other',
            dob: values[headerMap['dob']] || '2000-01-01',
            mobile: values[headerMap['mobile']] || '',
            email: values[headerMap['email']] || '',
            district: values[headerMap['district']] || '',
            schoolName: values[headerMap['schoolName']] || '',
            boardType: (values[headerMap['boardType']] || 'State Board') as 'State Board' | 'CBSE' | 'ICSE' | 'Other',
            community: (values[headerMap['community']] || 'General') as 'General' | 'OBC' | 'SC' | 'ST' | 'EWS',
            quota: (values[headerMap['quota']] || 'Counselling Quota') as 'Management Quota' | 'Counselling Quota',
            cutoffMark: parseFloat(values[headerMap['cutoffMark']]) || 0,
            departmentId,
            admissionStatus: (values[headerMap['admissionStatus']] || 'Applied') as 'Applied' | 'Under Review' | 'Selected' | 'Rejected' | 'Waitlisted',
            applicationDate: values[headerMap['applicationDate']] || new Date().toISOString().split('T')[0]
          };

          await addStudent(studentData);
          importedCount++;
        }

        if (importedCount > 0) {
          await refreshData();
        }

        alert(`Successfully imported ${importedCount} students!`);
      } catch (error) {
        console.error('CSV import error:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <div className="card title-card">
        <div>
          <h1>Student Details</h1>
          <p style={{ color: '#94a3b8' }}>Manage student profiles, view application progress and identify top performers.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            style={{ display: 'none' }}
            aria-label="Import CSV file"
          />
          <button type="button" className="button-secondary" onClick={() => fileInputRef.current?.click()} title="Import students from CSV">
            📥 Import CSV
          </button>
          <button type="button" className="button-secondary" onClick={downloadCSV} title="Download filtered students as CSV">
            📤 Export CSV
          </button>
          <Link to="/student/new" className="button-primary">Add Student</Link>
        </div>
      </div>

      <div className="kpi-grid section">
        <div className="card summary-card">
          <strong>{detailCount}</strong>
          <span>Filtered Students</span>
        </div>
        <div className="card summary-card">
          <strong>{selectedCount}</strong>
          <span>Selected Students</span>
        </div>
        <div className="card summary-card">
          <strong>{averageCutoff}</strong>
          <span>Average Cutoff</span>
        </div>
        <div className="card summary-card">
          <strong>{weekNew}</strong>
          <span>New This Week</span>
        </div>
      </div>

      {selectedStudent && (
        <div className="card section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>{selectedStudent.studentName}</h2>
              <p style={{ color: '#94a3b8', margin: 4 }}>{selectedStudent.applicationId} · {selectedStudent.district} · {selectedStudent.schoolName}</p>
            </div>
            <button type="button" className="button-secondary" onClick={() => setSelectedStudent(null)}>
              Close
            </button>
          </div>
          <div className="student-detail-grid">
            <div><strong>Status</strong><br /><StatusTag status={selectedStudent.admissionStatus} /></div>
            <div><strong>Department</strong><br />{departments.find((dept) => dept.id === selectedStudent.departmentId)?.departmentName || 'Unknown'}</div>
            <div><strong>Quota</strong><br />{selectedStudent.quota}</div>
            <div><strong>Board</strong><br />{selectedStudent.boardType}</div>
            <div><strong>Cutoff</strong><br />{selectedStudent.cutoffMark}</div>
            <div><strong>Applied</strong><br />{selectedStudent.applicationDate}</div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Update status:
              <select value={selectedStudent.admissionStatus} onChange={(e) => updateSelectedStatus(e.target.value as Student['admissionStatus'])}>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <button type="button" className="button-secondary" onClick={() => setSelectedStudent(null)}>
              Hide Details
            </button>
          </div>
        </div>
      )}

      <div className="section">
        <div className="quota-tabs">
          {quotaOptions.map((quota) => (
            <button
              key={quota}
              type="button"
              className={`tab-button ${quotaFilter === quota ? 'active' : ''}`}
              onClick={() => setQuotaFilter(quota)}
            >
              {quota}
            </button>
          ))}
        </div>

        <div className="filters">
          <input placeholder="Search student or application ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={boardFilter} onChange={(e) => setBoardFilter(e.target.value)}>
            {boardOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={quotaFilter} onChange={(e) => setQuotaFilter(e.target.value)}>
            {quotaOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="button" className="button-secondary" onClick={clearFilters} title="Reset all student filters">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="card section student-table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('applicationId')}>
                Application ID {sortField === 'applicationId' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('studentName')}>
                Name {sortField === 'studentName' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>District</th>
              <th>School</th>
              <th>Board</th>
              <th>Community</th>
              <th>Quota</th>
              <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('cutoffMark')}>
                Cutoff {sortField === 'cutoffMark' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th>Department</th>
              <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('admissionStatus')}>
                Status {sortField === 'admissionStatus' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
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
                <td>{student.quota}</td>
                <td>{student.cutoffMark}</td>
                <td>{departments.find((dept) => dept.id === student.departmentId)?.departmentName || 'Unknown'}</td>
                <td><StatusTag status={student.admissionStatus} /></td>
                <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="icon-button" onClick={() => setSelectedStudent(student)} title="View student details">🔍</button>
                  <Link className="icon-button" to={`/student/edit/${student.id}`} aria-label="Edit student">✏️</Link>
                  <button className="icon-button" aria-label="Delete student" onClick={async () => {
                    try {
                      await removeStudent(student.id);
                      if (selectedStudent?.id === student.id) setSelectedStudent(null);
                    } catch (error) {
                      console.error('Failed to delete student:', error);
                    }
                  }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
