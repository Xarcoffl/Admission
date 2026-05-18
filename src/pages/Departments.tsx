import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmission } from '../data/admissionContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const departmentShortNames: Record<string, string> = {
  'Electronics and Communication Engineering': 'ECE',
  'Electrical and Electronics Engineering': 'EEE',
  'Mechanical Engineering': 'Mech',
  'Computer Science Engineering': 'CSE',
  'Civil Engineering': 'CE'
};

const getDepartmentLabel = (name: string) => departmentShortNames[name] || name
  .split(' ')
  .map((part) => part[0])
  .join('')
  .toUpperCase()
  .slice(0, 4);

const chartTooltipStyle = {
  background: '#0f172a',
  border: '1px solid rgba(148, 163, 184, 0.16)',
  color: '#e2e8f0',
  fontSize: '13px',
  padding: '12px',
  borderRadius: '8px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
};

const tooltipFormatter = (value: number | string, name: string) => [value, typeof name === 'string' ? name : 'Value'];

export default function Departments() {
  const { departments, students } = useAdmission();

  const departmentData = useMemo(() => {
    return departments.map((department) => {
      const studentCount = students.filter((student) => student.departmentId === department.id).length;
      const cutoffMarks = students.filter((student) => student.departmentId === department.id).map((student) => student.cutoffMark);
      return {
        ...department,
        seatsAvailable: department.totalSeats,
        seatsFilled: department.filledSeats,
        remainingSeats: department.totalSeats - department.filledSeats,
        studentCount,
        highestCutoff: cutoffMarks.length ? Math.max(...cutoffMarks).toFixed(1) : '0.0',
        lowestCutoff: cutoffMarks.length ? Math.min(...cutoffMarks).toFixed(1) : '0.0',
        averageCutoff: cutoffMarks.length ? (cutoffMarks.reduce((sum, item) => sum + item, 0) / cutoffMarks.length).toFixed(1) : '0.0'
      };
    });
  }, [departments, students]);

  const occupancyData = departmentData.map((dept) => ({
    name: getDepartmentLabel(dept.departmentName),
    filled: dept.seatsFilled,
    remaining: dept.remainingSeats
  }));

  const preferenceData = departmentData
    .map((dept) => ({ name: getDepartmentLabel(dept.departmentName), value: dept.studentCount }))
    .sort((a, b) => b.value - a.value);

  const quotaDistribution = departments.map((dept) => {
    const management = students.filter((student) => student.departmentId === dept.id && student.quota === 'Management Quota').length;
    const counselling = students.filter((student) => student.departmentId === dept.id && student.quota === 'Counselling Quota').length;
    return {
      name: getDepartmentLabel(dept.departmentName),
      management,
      counselling
    };
  });

  const trendData = Array.from({ length: 7 }, (_, index) => ({
    date: `Week ${index + 1}`,
    applications: Math.max(0, 30 + index * 8 + Math.round(Math.random() * 12))
  }));

  return (
    <div>
      <div className="card title-card">
        <div>
          <h1>Department Analytics</h1>
          <p style={{ color: '#94a3b8' }}>Track seat allocation, cutoff performance and demand for each department.</p>
        </div>
        <Link to="/department/new" className="button-primary">Add Department</Link>
      </div>

      <div className="kpi-grid section">
        {departmentData.map((dept) => (
          <div key={dept.id} className="kpi-card">
            <div className="value">{dept.departmentName}</div>
            <div className="label">Seats: {dept.seatsFilled}/{dept.seatsAvailable}</div>
            <div className="label">Avg Cutoff: {dept.averageCutoff}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 section">
        <div className="card chart-card">
          <div className="section-title"><h3>Department Seat Occupancy</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={occupancyData} margin={{ top: 24, right: 32, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fill: '#cbd5e1' }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#e2e8f0' }} wrapperStyle={{ zIndex: 99 }} cursor={{ fill: 'rgba(79, 139, 255, 0.1)' }} />
              <Bar dataKey="filled" stackId="a" fill="#34d399" radius={[10, 10, 0, 0]} isAnimationActive />
              <Bar dataKey="remaining" stackId="a" fill="#4f8bff" radius={[0, 0, 10, 10]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <div className="section-title"><h3>Department Preference Ranking</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={preferenceData} layout="vertical" margin={{ top: 12, right: 32, left: 12, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" tick={{ fill: '#cbd5e1' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1' }} width={120} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#e2e8f0' }} wrapperStyle={{ zIndex: 99 }} cursor={{ fill: 'rgba(79, 139, 255, 0.1)' }} />
              <Bar dataKey="value" fill="#4f8bff" radius={[10, 10, 10, 10]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2 section">
        <div className="card chart-card">
          <div className="section-title"><h3>Admission Trend by Date</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trendData} margin={{ top: 24, right: 32, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fill: '#cbd5e1' }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#e2e8f0' }} wrapperStyle={{ zIndex: 99 }} cursor={{ fill: 'rgba(249, 168, 38, 0.1)' }} />
              <Bar dataKey="applications" fill="#f9a826" radius={[10, 10, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <div className="section-title"><h3>Department-wise Quota Distribution</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={quotaDistribution} margin={{ top: 24, right: 32, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fill: '#cbd5e1' }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#e2e8f0' }} wrapperStyle={{ zIndex: 99 }} cursor={{ fill: 'rgba(79, 139, 255, 0.1)' }} />
              <Legend wrapperStyle={{ color: '#cbd5e1' }} />
              <Bar dataKey="management" stackId="a" fill="#34d399" radius={[10, 10, 0, 0]} isAnimationActive />
              <Bar dataKey="counselling" stackId="a" fill="#4f8bff" radius={[0, 0, 10, 10]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card section table-wrapper">
        <div className="section-title"><h3>Department Management</h3></div>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>HOD</th>
              <th>Total Seats</th>
              <th>Filled Seats</th>
              <th>Remaining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departmentData.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.departmentName}</td>
                <td>{dept.hodName}</td>
                <td>{dept.totalSeats}</td>
                <td>{dept.filledSeats}</td>
                <td>{dept.remainingSeats}</td>
                <td>
                  <Link className="button-secondary" to={`/department/edit/${dept.id}`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
