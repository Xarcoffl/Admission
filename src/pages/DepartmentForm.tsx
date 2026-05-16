import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmission } from '../data/admissionContext';
import { Department } from '../data/mockData';

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function DepartmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { departments, addDepartment, updateDepartment } = useAdmission();
  const existing = useMemo(() => departments.find((department) => department.id === id), [departments, id]);

  const [form, setForm] = useState<Department>({
    id: existing?.id ?? generateId('dept'),
    departmentName: existing?.departmentName ?? '',
    totalSeats: existing?.totalSeats ?? 0,
    filledSeats: existing?.filledSeats ?? 0,
    hodName: existing?.hodName ?? ''
  });

  const handleChange = (key: keyof Department, value: string | number) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    if (!form.departmentName || !form.hodName) return;
    try {
      if (existing) {
        await updateDepartment(form);
      } else {
        await addDepartment(form);
      }
      navigate('/departments');
    } catch (error) {
      console.error('Failed to save department:', error);
    }
  };

  return (
    <div>
      <div className="card title-card">
        <div>
          <h1>{existing ? 'Edit Department' : 'New Department'}</h1>
          <p style={{ color: '#94a3b8' }}>Update department details and seat capacities for admission planning.</p>
        </div>
      </div>

      <div className="card section">
        <div className="form-grid">
          <div>
            <label>Department Name</label>
            <input value={form.departmentName} onChange={(e) => handleChange('departmentName', e.target.value)} />
          </div>
          <div>
            <label>HOD Name</label>
            <input value={form.hodName} onChange={(e) => handleChange('hodName', e.target.value)} />
          </div>
          <div>
            <label>Total Seats</label>
            <input type="number" min="0" value={form.totalSeats} onChange={(e) => handleChange('totalSeats', Number(e.target.value))} />
          </div>
          <div>
            <label>Filled Seats</label>
            <input type="number" min="0" value={form.filledSeats} onChange={(e) => handleChange('filledSeats', Number(e.target.value))} />
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button className="button-primary" onClick={save}>{existing ? 'Save Department' : 'Create Department'}</button>
          <button className="button-secondary" onClick={() => navigate('/departments')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
