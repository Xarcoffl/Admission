import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmission } from '../data/admissionContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Tooltip as ReTooltip, Cell, Treemap } from 'recharts';

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

  const occupancyData = departmentData.map((dept) => ({ name: dept.departmentName, filled: dept.seatsFilled, remaining: dept.remainingSeats }));
  const funnelData = departmentData.map((dept) => ({ name: dept.departmentName, value: dept.studentCount }));
  const genderDistribution = departments.map((dept) => {
    const male = students.filter((student) => student.departmentId === dept.id && student.gender === 'Male').length;
    const female = students.filter((student) => student.departmentId === dept.id && student.gender === 'Female').length;
    return { name: dept.departmentName, male, female };
  }).flatMap((dept) => [
    { name: `${dept.name} - Male`, value: dept.male },
    { name: `${dept.name} - Female`, value: dept.female }
  ]);

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
            <BarChart data={occupancyData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fill: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
              <Bar dataKey="filled" stackId="a" fill="#34d399" radius={[10, 10, 0, 0]} />
              <Bar dataKey="remaining" stackId="a" fill="#4f8bff" radius={[0, 0, 10, 10]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <div className="section-title"><h3>Department Preference Ranking</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <FunnelChart>
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                {funnelData.map((entry, index) => (
                  <Cell key={entry.name} fill={index % 2 === 0 ? '#4f8bff' : '#34d399'} />
                ))}
              </Funnel>
              <ReTooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2 section">
        <div className="card chart-card">
          <div className="section-title"><h3>Admission Trend by Date</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trendData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fill: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
              <Bar dataKey="applications" fill="#f9a826" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <div className="section-title"><h3>Department-wise Gender Distribution</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <Treemap data={genderDistribution} dataKey="value" nameKey="name" stroke="#fff" fill="#4f8bff" />
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
