import express from 'express';
import { query, getOne, execute } from '../database/db.js';

const router = express.Router();

// GET sections (filtered by dept or year if requested)
router.get('/', async (req, res) => {
  try {
    const { department_id, year_label } = req.query;

    let sql = `
      SELECT sec.*, 
        d.name as department_name, d.code as department_code,
        a.name as adviser_name, a.designation as adviser_designation,
        (SELECT COUNT(*) FROM students s WHERE s.section_id = sec.id AND s.status = 'active') as student_count
      FROM sections sec
      JOIN departments d ON sec.department_id = d.id
      LEFT JOIN advisers a ON sec.adviser_id = a.id
    `;
    const params = [];

    const conditions = [];
    if (department_id) {
      conditions.push('sec.department_id = ?');
      params.push(department_id);
    }
    if (year_label) {
      conditions.push('sec.year_label = ?');
      params.push(year_label);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY d.code, sec.year_label, sec.section_name';

    const sections = await query(sql, params);
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add section
router.post('/', async (req, res) => {
  try {
    const { department_id, year_label, section_name, academic_year, adviser_id } = req.body;
    if (!department_id || !year_label || !section_name) {
      return res.status(400).json({ error: 'Department, year, and section name are required' });
    }

    const result = await execute(`
      INSERT INTO sections (department_id, year_label, section_name, academic_year, adviser_id)
      VALUES (?, ?, ?, ?, ?)
    `, [department_id, year_label, section_name, academic_year || '2026-2027', adviser_id || null]);

    const newSec = await getOne('SELECT * FROM sections WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Section created successfully', section: newSec });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update section
router.put('/:id', async (req, res) => {
  try {
    const { department_id, year_label, section_name, academic_year, adviser_id } = req.body;
    const { id } = req.params;

    await execute(`
      UPDATE sections SET department_id = ?, year_label = ?, section_name = ?, academic_year = ?, adviser_id = ?
      WHERE id = ?
    `, [department_id, year_label, section_name, academic_year || '2026-2027', adviser_id || null, id]);

    const updated = await getOne('SELECT * FROM sections WHERE id = ?', [id]);
    res.json({ message: 'Section updated successfully', section: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE section
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await execute('DELETE FROM sections WHERE id = ?', [id]);
    res.json({ message: 'Section deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
