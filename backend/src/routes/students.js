import express from 'express';
import { query, getOne, execute } from '../database/db.js';

const router = express.Router();

// GET students list with filters & search
router.get('/', async (req, res) => {
  try {
    const { department_id, year_label, section_id, gender, search, status } = req.query;

    let sql = `
      SELECT s.*, 
        d.name as department_name, d.code as department_code,
        sec.section_name, sec.year_label as section_year,
        a.name as adviser_name
      FROM students s
      JOIN departments d ON s.department_id = d.id
      JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN advisers a ON s.adviser_id = a.id
    `;

    const conditions = [];
    const params = [];

    if (department_id) {
      conditions.push('s.department_id = ?');
      params.push(department_id);
    }
    if (year_label) {
      conditions.push('s.year_label = ?');
      params.push(year_label);
    }
    if (section_id) {
      conditions.push('s.section_id = ?');
      params.push(section_id);
    }
    if (gender) {
      conditions.push('s.gender = ?');
      params.push(gender);
    }
    if (status) {
      conditions.push('s.status = ?');
      params.push(status);
    } else {
      conditions.push("s.status = 'active'");
    }

    if (search) {
      conditions.push('(s.name LIKE ? OR s.roll_number LIKE ? OR s.register_number LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY s.roll_number ASC';

    const students = await query(sql, params);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await getOne(`
      SELECT s.*, 
        d.name as department_name, d.code as department_code,
        sec.section_name,
        a.name as adviser_name
      FROM students s
      JOIN departments d ON s.department_id = d.id
      JOIN sections sec ON s.section_id = sec.id
      LEFT JOIN advisers a ON s.adviser_id = a.id
      WHERE s.id = ?
    `, [id]);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add student
router.post('/', async (req, res) => {
  try {
    const {
      name, roll_number, register_number, photo_url,
      gender, department_id, year_label, section_id, adviser_id
    } = req.body;

    if (!name || !roll_number || !register_number || !gender || !department_id || !section_id) {
      return res.status(400).json({ error: 'Name, roll number, register number, gender, department and section are required' });
    }

    // Default SVG avatar if photo_url is missing
    const avatar = photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&gender=${gender.toLowerCase()}`;

    const result = await execute(`
      INSERT INTO students (name, roll_number, register_number, photo_url, gender, department_id, year_label, section_id, adviser_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, roll_number, register_number, avatar, gender, department_id, year_label || '1st Year', section_id, adviser_id || null]);

    const newStudent = await getOne('SELECT * FROM students WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Student added successfully', student: newStudent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  try {
    const {
      name, roll_number, register_number, photo_url,
      gender, department_id, year_label, section_id, adviser_id, status
    } = req.body;
    const { id } = req.params;

    await execute(`
      UPDATE students SET
        name = ?, roll_number = ?, register_number = ?, photo_url = ?,
        gender = ?, department_id = ?, year_label = ?, section_id = ?, adviser_id = ?, status = ?
      WHERE id = ?
    `, [name, roll_number, register_number, photo_url, gender, department_id, year_label, section_id, adviser_id || null, status || 'active', id]);

    const updated = await getOne('SELECT * FROM students WHERE id = ?', [id]);
    res.json({ message: 'Student updated successfully', student: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await execute('UPDATE students SET status = "inactive" WHERE id = ?', [id]);
    res.json({ message: 'Student marked inactive' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
