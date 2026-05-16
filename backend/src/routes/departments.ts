import express from 'express';
import { dataStore, Department } from '../models/data';
import { AuthRequest, requireRole } from '../middleware/auth';
import { io } from '../server';

const router = express.Router();

// Get all departments
router.get('/', async (req: AuthRequest, res) => {
  try {
    const departments = await dataStore.getAllDepartments();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get department by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const department = await dataStore.getDepartmentById(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create department (admin only)
router.post('/', requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const department: Department = req.body;
    const newDepartment = await dataStore.createDepartment(department);
    io.emit('departmentCreated', newDepartment);
    res.status(201).json(newDepartment);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update department (admin only)
router.put('/:id', requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const updatedDepartment = await dataStore.updateDepartment(req.params.id, req.body);
    if (!updatedDepartment) {
      return res.status(404).json({ error: 'Department not found' });
    }
    io.emit('departmentUpdated', updatedDepartment);
    res.json(updatedDepartment);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete department (admin only)
router.delete('/:id', requireRole('admin'), async (req: AuthRequest, res) => {
  try {
    const deleted = await dataStore.deleteDepartment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Department not found' });
    }
    io.emit('departmentDeleted', req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
