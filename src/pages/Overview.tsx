import { useMemo, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
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

const departmentShortNames: Record<string, string> = {
  'Electronics and Communication Engineering': 'ECE',
  'Electrical and Electronics Engineering': 'EEE',
  'Mechanical Engineering': 'Mech',
  'Computer Science Engineering': 'CSE',
  'Civil Engineering': 'CE'
};

const getDepartmentLabel = (name: string) => {
  if (departmentShortNames[name]) return departmentShortNames[name];
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);
};

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

const sanitizeCsvValue = (value: string | number | boolean | null | undefined) => {
  const raw = value ?? '';
  const escaped = String(raw).replace(/"/g, '""');
  return `"${escaped}"`;
};

const createCsvContent = (rows: Array<Array<string | number>>) =>
  rows.map((row) => row.map(sanitizeCsvValue).join(',')).join('\n');

export default function Overview() {
  const { students, departments, lastRefreshed, refreshData } = useAdmission();
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const dashboardRef = useRef<HTMLDivElement | null>(null);

  const downloadDashboardImage = async () => {
    if (!dashboardRef.current) return;

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#010617',
        scale: 2,
        useCORS: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `analytics-dashboard_${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Dashboard screenshot failed:', error);
      alert('Unable to download the dashboard image. Please try again.');
    }
  };

  const downloadInteractiveDashboard = () => {
    const exportData = {
      title: 'College Admission Analytics Dashboard',
      lastRefreshed,
      summary: [
        ['Total Applications Received', totalApplications],
        ['Total Students Admitted', totalAdmitted],
        ['Total Departments', departments.length],
        ['Average Student Cutoff', avgCutoff],
        ['Highest Cutoff', highestCutoff],
        ['Lowest Cutoff', lowestCutoff],
        ['Admission Conversion Rate', `${conversionRate}%`]
      ],
      applicationsByDepartment,
      statusDistribution,
      cutoffByDepartment,
      genderData,
      regionData
    };

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${exportData.title}</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #020617; color: #e2e8f0; }
    .container { padding: 24px; max-width: 1400px; margin: auto; }
    h1 { margin-bottom: 8px; font-size: 2rem; }
    .meta { color: #94a3b8; margin-bottom: 24px; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .summary-card { background: #0f172a; border: 1px solid rgba(148, 163, 184, 0.12); border-radius: 16px; padding: 18px; }
    .summary-card span { display: block; color: #94a3b8; margin-bottom: 8px; font-size: 0.95rem; }
    .summary-card strong { font-size: 1.5rem; display: block; }
    .chart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
    .chart-card { padding: 18px; border-radius: 18px; background: #0f172a; border: 1px solid rgba(148, 163, 184, 0.12); }
    .chart-card h2 { margin-top: 0; font-size: 1.05rem; margin-bottom: 14px; }
    canvas { width: 100% !important; height: 320px !important; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${exportData.title}</h1>
    <div class="meta">Last refreshed: ${exportData.lastRefreshed}</div>
    <div class="summary-grid">
      ${exportData.summary.map(([label, value]) => `
        <div class="summary-card">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `).join('')}
    </div>

    <div class="chart-grid">
      <div class="chart-card">
        <h2>Department-wise Applications</h2>
        <canvas id="deptChart"></canvas>
      </div>
      <div class="chart-card">
        <h2>Admission Status Distribution</h2>
        <canvas id="statusChart"></canvas>
      </div>
      <div class="chart-card">
        <h2>Cutoff Trend Analysis</h2>
        <canvas id="cutoffChart"></canvas>
      </div>
      <div class="chart-card">
        <h2>Gender Distribution</h2>
        <canvas id="genderChart"></canvas>
      </div>
      <div class="chart-card" style="grid-column: span 2;">
        <h2>Region-wise Student Count</h2>
        <canvas id="regionChart"></canvas>
      </div>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    const exportData = ${JSON.stringify(exportData)};

    const createBarChart = (ctx, labels, data, label, color) => new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label, data, backgroundColor: color, borderRadius: 12, borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: '#cbd5e1' }, grid: { display: false } }, y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(148, 163, 184, 0.12)' } } }, plugins: { legend: { display: false }, tooltip: { enabled: true, backgroundColor: '#0f172a', titleColor: '#e2e8f0', bodyColor: '#e2e8f0' } } }
    });

    const createPieChart = (ctx, labels, data, backgroundColors) => new Chart(ctx, {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: backgroundColors, borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1' } }, tooltip: { enabled: true, backgroundColor: '#0f172a', titleColor: '#e2e8f0', bodyColor: '#e2e8f0' } } }
    });

    const createLineChart = (ctx, labels, data, label, color) => new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{ label, data, borderColor: color, backgroundColor: 'rgba(52, 211, 153, 0.16)', fill: true, tension: 0.4, pointRadius: 3 }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: '#cbd5e1' }, grid: { display: false } }, y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(148, 163, 184, 0.12)' } } }, plugins: { legend: { display: false }, tooltip: { enabled: true, backgroundColor: '#0f172a', titleColor: '#e2e8f0', bodyColor: '#e2e8f0' } } }
    });

    const deptCtx = document.getElementById('deptChart');
    if (deptCtx) createBarChart(deptCtx, exportData.applicationsByDepartment.map((item) => item.department), exportData.applicationsByDepartment.map((item) => item.applications), 'Applications', '#4f8bff');

    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) createPieChart(statusCtx, exportData.statusDistribution.map((item) => item.name), exportData.statusDistribution.map((item) => item.value), ['#4f8bff','#f9a826','#34d399','#f87171','#8b5cf6']);

    const cutoffCtx = document.getElementById('cutoffChart');
    if (cutoffCtx) createLineChart(cutoffCtx, exportData.cutoffByDepartment.map((item) => item.department), exportData.cutoffByDepartment.map((item) => item.cutoff), 'Average Cutoff', '#34d399');

    const genderCtx = document.getElementById('genderChart');
    if (genderCtx) createPieChart(genderCtx, exportData.genderData.map((item) => item.name), exportData.genderData.map((item) => item.value), ['#4f8bff','#f472b6','#a78bfa']);

    const regionCtx = document.getElementById('regionChart');
    if (regionCtx) createBarChart(regionCtx, exportData.regionData.map((item) => item.name), exportData.regionData.map((item) => item.value), 'Student Count', '#8b5cf6');
  </script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `college_admission_dashboard_${new Date().getTime()}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
    department: getDepartmentLabel(dept.departmentName),
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
    return { department: getDepartmentLabel(dept.departmentName), cutoff: Number(avg.toFixed(1)) };
  });

  const genderData = genders.map((gender) => ({ name: gender, value: students.filter((student) => student.gender === gender).length }));
  const regionData = Object.entries(students.reduce((acc, student) => {
    acc[student.district] = (acc[student.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

  const downloadAnalyticsReport = () => {
    const summaryRows = [
      ['Metric', 'Value'],
      ['Total Applications Received', totalApplications],
      ['Total Students Admitted', totalAdmitted],
      ['Total Departments', departments.length],
      ['Average Student Cutoff', avgCutoff],
      ['Highest Cutoff', highestCutoff],
      ['Lowest Cutoff', lowestCutoff],
      ['Admission Conversion Rate', `${conversionRate}%`]
    ];

    const departmentRows = [['Department', 'Applications'], ...applicationsByDepartment.map((item) => [item.department, item.applications])];
    const statusRows = [['Admission Status', 'Count'], ...statusDistribution.map((item) => [item.name, item.value])];
    const cutoffRows = [['Department', 'Average Cutoff'], ...cutoffByDepartment.map((item) => [item.department, item.cutoff])];
    const genderRows = [['Gender', 'Count'], ...genderData.map((item) => [item.name, item.value])];
    const regionRows = [['District', 'Student Count'], ...regionData.map((item) => [item.name, item.value])];

    const rows: Array<Array<string | number>> = [
      ['College Admission Analytics Dashboard Export'],
      [],
      ...summaryRows,
      [],
      ['Department-wise Applications'],
      ...departmentRows,
      [],
      ['Admission Status Distribution'],
      ...statusRows,
      [],
      ['Cutoff Trend Analysis'],
      ...cutoffRows,
      [],
      ['Gender Distribution'],
      ...genderRows,
      [],
      ['Region-wise Student Count'],
      ...regionRows
    ];

    const csv = createCsvContent(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `college_admission_analytics_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div ref={dashboardRef}>
      <div className="card title-card overview-header">
        <div>
          <h1>College Admission Analytics</h1>
          <p style={{ color: '#94a3b8' }}>Live view of student applications, department performance and admission trends.</p>
        </div>
        <div className="overview-header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="button-secondary" onClick={downloadAnalyticsReport} title="Download current analytics as CSV">
            📤 Download Data
          </button>
          <button type="button" className="button-secondary" onClick={downloadInteractiveDashboard} title="Download an interactive dashboard HTML file">
            📂 Download Interactive Dashboard
          </button>
          <button type="button" className="button-secondary" onClick={downloadDashboardImage} title="Download the analytics dashboard as an image">
            🖼️ Download Snapshot
          </button>
          <button type="button" className="refresh-button" onClick={refreshData} aria-label="Refresh dashboard">
            ⟳
          </button>
          <div style={{ textAlign: 'right', color: '#94a3b8' }}>
            <div>Last refreshed</div>
            <div>{lastRefreshed}</div>
          </div>
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
            <BarChart data={applicationsByDepartment} margin={{ top: 24, right: 32, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="department" tick={{ fill: '#cbd5e1' }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#e2e8f0' }} wrapperStyle={{ zIndex: 99 }} cursor={{ fill: 'rgba(79, 139, 255, 0.1)' }} />
              <Bar dataKey="applications" fill="#4f8bff" radius={[10, 10, 0, 0]} label={{ position: 'top', fill: '#e2e8f0' }} isAnimationActive />
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
              <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#e2e8f0' }} wrapperStyle={{ zIndex: 99 }} />
              <Legend verticalAlign="bottom" wrapperStyle={{ color: '#cbd5e1' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2 section">
        <div className="card chart-card">
          <div className="section-title"><h3>Cutoff Trend Analysis</h3></div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={cutoffByDepartment} margin={{ top: 24, right: 32, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="4 4" opacity={0.2} />
              <XAxis dataKey="department" tick={{ fill: '#cbd5e1' }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} labelStyle={{ color: '#94a3b8' }} itemStyle={{ color: '#e2e8f0' }} wrapperStyle={{ zIndex: 99 }} cursor={{ fill: 'rgba(52, 211, 153, 0.1)' }} />
              <Line type="monotone" dataKey="cutoff" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive label={{ position: 'top', fill: '#e2e8f0' }} />
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
              <Tooltip contentStyle={chartTooltipStyle} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} wrapperStyle={{ zIndex: 99 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card section chart-card">
        <div className="section-title"><h3>Region-wise Student Count</h3></div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={regionData} margin={{ top: 24, right: 32, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" tick={{ fill: '#cbd5e1' }} angle={-45} textAnchor="end" height={80} />
            <YAxis tick={{ fill: '#cbd5e1' }} />
            <Tooltip contentStyle={chartTooltipStyle} formatter={tooltipFormatter} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} wrapperStyle={{ zIndex: 99 }} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[10, 10, 0, 0]} label={{ position: 'top', fill: '#e2e8f0' }} isAnimationActive />

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
