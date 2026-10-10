import express from 'express';
import { query, getOne, execute } from '../database/db.js';

const router = express.Router();

// GET all departments
router.get('/', async (req, res) => {
  try {
    const depts = await query(`
      SELECT d.*, 
        (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id AND s.status = 'active') as student_count,
        (SELECT COUNT(*) FROM sections sec WHERE sec.department_id = d.id) as section_count
      FROM departments d
      WHERE d.status IS NULL OR d.status = 'active'
      ORDER BY d.id ASC
    `);
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add department
router.post('/', async (req, res) => {
  try {
    const { name, code, description, hod_name, logo_url } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and code are required' });
    }

    const result = await execute(`
      INSERT INTO departments (name, code, description, hod_name, logo_url, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `, [name, code, description || '', hod_name || '', logo_url || '']);

    const deptId = result.lastID;

    // Auto-create default sections across 1st-4th years for the new department
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    for (const yr of years) {
      await execute(`
        INSERT INTO sections (department_id, year_label, section_name)
        VALUES (?, ?, 'Section A')
      `, [deptId, yr]);
    }

    const newDept = await getOne('SELECT * FROM departments WHERE id = ?', [deptId]);
    res.status(201).json({ message: 'Department created successfully', department: newDept });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update department
router.put('/:id', async (req, res) => {
  try {
    const { name, code, description, hod_name, logo_url, status } = req.body;
    const { id } = req.params;

    await execute(`
      UPDATE departments SET name = ?, code = ?, description = ?, hod_name = ?, logo_url = ?, status = ?
      WHERE id = ?
    `, [name, code, description || '', hod_name || '', logo_url || '', status || 'active', id]);

    const updated = await getOne('SELECT * FROM departments WHERE id = ?', [id]);
    res.json({ message: 'Department updated successfully', department: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE / deactivate department
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await execute('UPDATE departments SET status = "inactive" WHERE id = ?', [id]);
    res.json({ message: 'Department deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
