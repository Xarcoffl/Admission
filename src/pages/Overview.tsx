import { useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useAdmission } from '../data/admissionContext';
import KpiCard from '../components/KpiCard';

const statusColors: Record<string, string> = {
  Applied: '#4f8bff',
  'Under Review': '#f9a826',
  Selected: '#34d399',
  Rejected: '#f87171',
  Waitlisted: '#8b5cf6'
};

const genders = ['Male', 'Female', 'Other'];
const communities = ['General', 'OBC', 'SC', 'ST', 'EWS'];

export default function Overview() {
  const { students, departments, lastRefreshed } = useAdmission();
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (departmentFilter !== 'All' && student.departmentId !== departmentFilter) return false;
      if (genderFilter !== 'All' && student.gender !== genderFilter) return false;
      if (statusFilter !== 'All' && student.admissionStatus !== statusFilter) return false;
      return true;
    });
  }, [students, departmentFilter, genderFilter, statusFilter]);

  const totalApplications = filteredStudents.length;
  const totalAdmitted = filteredStudents.filter((student) => student.admissionStatus === 'Selected').length;
  const avgCutoff = filteredStudents.length ? (filteredStudents.reduce((sum, item) => sum + item.cutoffMark, 0) / filteredStudents.length).toFixed(1) : '0.0';
  const highestCutoff = filteredStudents.length ? Math.max(...filteredStudents.map((item) => item.cutoffMark)).toFixed(1) : '0.0';
  const lowestCutoff = filteredStudents.length ? Math.min(...filteredStudents.map((item) => item.cutoffMark)).toFixed(1) : '0.0';
  const maleCount = filteredStudents.filter((student) => student.gender === 'Male').length;
  const femaleCount = filteredStudents.filter((student) => student.gender === 'Female').length;
  const conversionRate = totalApplications ? ((totalAdmitted / totalApplications) * 100).toFixed(1) : '0.0';

  const applicationsByDepartment = departments.map((dept) => ({
    department: dept.departmentName,
    applications: students.filter((student) => student.departmentId === dept.id).length
  }));

  const statusDistribution = Object.entries(
    students.reduce((acc, student) => {
      acc[student.admissionStatus] = (acc[student.admissionStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const cutoffByDepartment = departments.map((dept) => {
    const values = students.filter((student) => student.departmentId === dept.id).map((item) => item.cutoffMark);
    const avg = values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : 0;
    return { department: dept.departmentName, cutoff: Number(avg.toFixed(1)) };
  });

  const genderData = genders.map((gender) => ({ name: gender, value: students.filter((student) => student.gender === gender).length }));
  const regionData = Object.entries(students.reduce((acc, student) => {
    acc[student.district] = (acc[student.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="card title-card">
        <div>
          <h1>College Admission Analytics</h1>
          <p style={{ color: '#94a3b8' }}>Live view of student applications, department performance and admission trends.</p>
        </div>
        <div style={{ textAlign: 'right', color: '#94a3b8' }}>
          <div>Last refreshed</div>
          <div>{lastRefreshed}</div>
        </div>
      </div>

      <div className="kpi-grid section">
        <KpiCard label="Total Applications Received" value={totalApplications} />
        <KpiCard label="Total Students Admitted" value={totalAdmitted} />
        <KpiCard label="Total Departments" value={departments.length} />
        <KpiCard label="Average Student Cutoff" value={avgCutoff} />
        <KpiCard label="Highest Cutoff" value={highestCutoff} />
        <KpiCard label="Lowest Cutoff" value={lowestCutoff} />
        <KpiCard label="Admission Conversion Rate" value={`${conversionRate}%`} />
      </div>

      <div className="section">
        <div className="section-title">
          <div>
            <h3>Filters</h3>
            <p style={{ color: '#94a3b8' }}>Refine the dashboard using department, gender, or admission status.</p>
          </div>
        </div>

        <div className="filters">
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
            ))}
          </select>
          <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
            <option value="All">All Genders</option>
            {genders.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            {statusDistribution.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid-2 section">
        <div className="card chart-card">
          <div className="section-title"><h3>Department-wise Applications</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={applicationsByDepartment} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="department" tick={{ fill: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
              <Bar dataKey="applications" fill="#4f8bff" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <div className="section-title"><h3>Admission Status Distribution</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={4}>
                {statusDistribution.map((entry) => (
                  <Cell key={entry.name} fill={statusColors[entry.name] || '#4f8bff'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
              <Legend verticalAlign="bottom" wrapperStyle={{ color: '#cbd5e1' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2 section">
        <div className="card chart-card">
          <div className="section-title"><h3>Cutoff Trend Analysis</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={cutoffByDepartment} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
              <XAxis dataKey="department" tick={{ fill: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
              <Line type="monotone" dataKey="cutoff" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <div className="section-title"><h3>Gender Distribution</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {genderData.map((entry) => (
                  <Cell key={entry.name} fill={entry.name === 'Male' ? '#4f8bff' : entry.name === 'Female' ? '#f472b6' : '#a78bfa'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card section chart-card">
        <div className="section-title"><h3>Region-wise Student Count</h3></div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={regionData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" tick={{ fill: '#cbd5e1' }} />
            <YAxis tick={{ fill: '#cbd5e1' }} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
