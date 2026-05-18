import express from 'express';
import { dataStore, Student } from '../models/data';
import { AuthRequest, requireRole } from '../middleware/auth';
import { io } from '../server';

const router = express.Router();

// Get all students
router.get('/', async (req: AuthRequest, res) => {
  try {
    const students = await dataStore.getAllStudents();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const student = await dataStore.getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create student (admin/officer only)
router.post('/', requireRole('admin', 'officer'), async (req: AuthRequest, res) => {
  try {
    const student: Student = req.body;
    const newStudent = await dataStore.createStudent(student);
    // If the DB helper returns the created student, emit and return it; otherwise fall back to 201 without body
    if (newStudent) {
      io.emit('studentCreated', newStudent);
      return res.status(201).json(newStudent);
    }
    io.emit('studentCreated', student);
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update student (admin/officer only)
router.put('/:id', requireRole('admin', 'officer'), async (req: AuthRequest, res) => {
  try {
    const updatedStudent = await dataStore.updateStudent(req.params.id, req.body);
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    io.emit('studentUpdated', updatedStudent);
    res.json(updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete student (admin/officer only)
router.delete('/:id', requireRole('admin', 'officer'), async (req: AuthRequest, res) => {
  try {
    const deleted = await dataStore.deleteStudent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Student not found' });
    }
    io.emit('studentDeleted', req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
