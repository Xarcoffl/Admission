import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmission } from '../data/admissionContext';
import { Student, Department } from '../data/mockData';

const statusOptions = ['Applied', 'Under Review', 'Selected', 'Rejected', 'Waitlisted'];
const genders = ['Male', 'Female', 'Other'];
const boards = ['State Board', 'CBSE', 'ICSE', 'Other'];
const communities = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const quotaOptions = ['Management Quota', 'Counselling Quota'];

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, departments, addStudent, updateStudent } = useAdmission();
  const existing = useMemo(() => students.find((student) => student.id === id), [students, id]);

  const [form, setForm] = useState<Student>({
    id: existing?.id ?? generateId('stu'),
    applicationId: existing?.applicationId ?? `APP-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
    studentName: existing?.studentName ?? '',
    gender: existing?.gender ?? 'Male',
    dob: existing?.dob ?? '',
    mobile: existing?.mobile ?? '',
    email: existing?.email ?? '',
    district: existing?.district ?? '',
    schoolName: existing?.schoolName ?? '',
    boardType: existing?.boardType ?? 'State Board',
    community: existing?.community ?? 'General',
    cutoffMark: existing?.cutoffMark ?? 0,
    departmentId: existing?.departmentId ?? departments[0]?.id ?? '',
    admissionStatus: existing?.admissionStatus ?? 'Applied',
    applicationDate: existing?.applicationDate ?? new Date().toISOString().slice(0, 10),
    quota: existing?.quota ?? 'Counselling Quota'
  });

  const departmentOptions = useMemo(() => departments, [departments]);

  const handleChange = (key: keyof Student, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    if (!form.studentName || !form.dob || !form.mobile || !form.email || !form.departmentId) {
      return;
    }
    try {
      if (existing) {
        await updateStudent(form);
      } else {
        await addStudent(form);
      }
      navigate('/students');
    } catch (error) {
      console.error('Failed to save student:', error);
    }
  };

  return (
    <div>
      <div className="card title-card">
        <div>
          <h1>{existing ? 'Edit Student' : 'New Student'}</h1>
          <p style={{ color: '#94a3b8' }}>Add or update application details for ongoing admissions.</p>
        </div>
      </div>

      <div className="card section">
        <div className="form-grid">
          <div>
            <label>Student Name</label>
            <input value={form.studentName} onChange={(e) => handleChange('studentName', e.target.value)} />
          </div>
          <div>
            <label>Gender</label>
            <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)}>
              {genders.map((gender) => <option key={gender}>{gender}</option>)}
            </select>
          </div>
          <div>
            <label>Date of Birth</label>
            <input type="date" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} />
          </div>
          <div>
            <label>Mobile Number</label>
            <input value={form.mobile} onChange={(e) => handleChange('mobile', e.target.value)} />
          </div>
          <div>
            <label>Email ID</label>
            <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
          <div>
            <label>District</label>
            <input value={form.district} onChange={(e) => handleChange('district', e.target.value)} />
          </div>
          <div>
            <label>School Name</label>
            <input value={form.schoolName} onChange={(e) => handleChange('schoolName', e.target.value)} />
          </div>
          <div>
            <label>Board Type</label>
            <select value={form.boardType} onChange={(e) => handleChange('boardType', e.target.value)}>
              {boards.map((board) => <option key={board}>{board}</option>)}
            </select>
          </div>
          <div>
            <label>Community</label>
            <select value={form.community} onChange={(e) => handleChange('community', e.target.value)}>
              {communities.map((comm) => <option key={comm}>{comm}</option>)}
            </select>
          </div>
          <div>
            <label>Quota</label>
            <select value={form.quota} onChange={(e) => handleChange('quota', e.target.value)}>
              {quotaOptions.map((quota) => <option key={quota}>{quota}</option>)}
            </select>
          </div>
          <div>
            <label>Cutoff Mark</label>
            <input type="number" step="0.1" value={form.cutoffMark} onChange={(e) => handleChange('cutoffMark', Number(e.target.value))} />
          </div>
          <div>
            <label>Department Applied</label>
            <select value={form.departmentId} onChange={(e) => handleChange('departmentId', e.target.value)}>
              {departmentOptions.map((dept) => <option key={dept.id} value={dept.id}>{dept.departmentName}</option>)}
            </select>
          </div>
          <div>
            <label>Admission Status</label>
            <select value={form.admissionStatus} onChange={(e) => handleChange('admissionStatus', e.target.value)}>
              {statusOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label>Application Date</label>
            <input type="date" value={form.applicationDate} onChange={(e) => handleChange('applicationDate', e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button className="button-primary" onClick={save}>{existing ? 'Save Changes' : 'Create Student'}</button>
          <button className="button-secondary" onClick={() => navigate('/students')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
