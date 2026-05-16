import { useMemo } from 'react';
import { useAdmission } from '../data/admissionContext';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import KpiCard from '../components/KpiCard';

const funnelStages = ['Applied', 'Verified', 'Shortlisted', 'Selected', 'Admitted'];
const funnelColors = ['#4f8bff', '#f9a826', '#8b5cf6', '#34d399', '#0ea5e9'];

export default function Insights() {
  const { students, lastRefreshed } = useAdmission();

  const dailyApplications = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((student) => {
      counts[student.applicationDate] = (counts[student.applicationDate] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, applications: value }));
  }, [students]);

  const admitted = students.filter((student) => student.admissionStatus === 'Selected').length;
  const rejected = students.filter((student) => student.admissionStatus === 'Rejected').length;
  const waitlisted = students.filter((student) => student.admissionStatus === 'Waitlisted').length;
  const total = students.length || 1;

  const weeklyGrowth = students.length ? Math.round((students.filter((student) => new Date(student.applicationDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length / students.length) * 100) : 0;
  const conversion = Math.round((admitted / total) * 100);
  const rejection = Math.round((rejected / total) * 100);
  const waitlist = Math.round((waitlisted / total) * 100);

  const funnelData = funnelStages.map((stage, index) => ({ name: stage, value: Math.max(1, Math.round((students.length - index * 2) / 1.6)) }));
  const schoolData = Object.entries(students.reduce((acc, item) => {
    acc[item.schoolName] = (acc[item.schoolName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));
  const communityData = Object.entries(students.reduce((acc, item) => {
    acc[item.community] = (acc[item.community] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <div className="card title-card">
        <div>
          <h1>Admission Performance Insights</h1>
          <p style={{ color: '#94a3b8' }}>Measure daily progress, conversion performance and community reach across admissions.</p>
        </div>
        <div style={{ color: '#94a3b8', textAlign: 'right' }}>
          <div>Updated</div>
          <div>{lastRefreshed}</div>
        </div>
      </div>

      <div className="kpi-grid section">
        <KpiCard label="Daily Applications" value={dailyApplications.reduce((sum, item) => sum + item.applications, 0)} />
        <KpiCard label="Weekly Admission Growth" value={`${weeklyGrowth}%`} />
        <KpiCard label="Conversion Percentage" value={`${conversion}%`} />
        <KpiCard label="Rejection Percentage" value={`${rejection}%`} />
        <KpiCard label="Waitlist Percentage" value={`${waitlist}%`} />
      </div>

      <div className="grid-2 section">
        <div className="card chart-card">
          <div className="section-title"><h3>Daily Application Timeline</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyApplications} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fill: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
              <Line dataKey="applications" stroke="#4f8bff" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <div className="section-title"><h3>Funnel Analysis</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fill: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
              <Bar dataKey="value" fill="#34d399" radius={[10, 10, 0, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={entry.name} fill={funnelColors[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2 section">
        <div className="card chart-card">
          <div className="section-title"><h3>School-wise Student Applications</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={schoolData} layout="vertical" margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" tick={{ fill: '#cbd5e1' }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#cbd5e1' }} width={130} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
              <Bar dataKey="value" fill="#4f8bff" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <div className="section-title"><h3>Community-wise Admission Ratio</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={communityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {communityData.map((entry, index) => (
                  <Cell key={entry.name} fill={['#4f8bff', '#34d399', '#f87171', '#f9a826', '#8b5cf6'][index % 5]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" wrapperStyle={{ color: '#cbd5e1' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.16)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
