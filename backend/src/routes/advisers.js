import express from 'express';
import { query, getOne, execute } from '../database/db.js';

const router = express.Router();

// GET all advisers
router.get('/', async (req, res) => {
  try {
    const advisers = await query(`
      SELECT a.*, d.name as department_name, d.code as department_code,
        (SELECT sec.section_name FROM sections sec WHERE sec.adviser_id = a.id LIMIT 1) as assigned_section_name,
        (SELECT sec.year_label FROM sections sec WHERE sec.adviser_id = a.id LIMIT 1) as assigned_year_label
      FROM advisers a
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE a.status IS NULL OR a.status = 'active'
      ORDER BY a.name ASC
    `);
    res.json(advisers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add adviser
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, designation, department_id, photo_url, section_id } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Adviser name is required' });
    }

    const avatar = photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const result = await execute(`
      INSERT INTO advisers (name, email, phone, designation, department_id, photo_url, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `, [name, email || '', phone || '', designation || 'Assistant Professor', department_id || null, avatar]);

    const adviserId = result.lastID;

    if (section_id) {
      await execute('UPDATE sections SET adviser_id = ? WHERE id = ?', [adviserId, section_id]);
    }

    const newAdv = await getOne('SELECT * FROM advisers WHERE id = ?', [adviserId]);
    res.status(201).json({ message: 'Adviser added successfully', adviser: newAdv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update adviser
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, designation, department_id, photo_url, section_id } = req.body;
    const { id } = req.params;

    await execute(`
      UPDATE advisers SET name = ?, email = ?, phone = ?, designation = ?, department_id = ?, photo_url = ?
      WHERE id = ?
    `, [name, email || '', phone || '', designation || 'Assistant Professor', department_id || null, photo_url || '', id]);

    if (section_id) {
      await execute('UPDATE sections SET adviser_id = ? WHERE id = ?', [id, section_id]);
    }

    const updated = await getOne('SELECT * FROM advisers WHERE id = ?', [id]);
    res.json({ message: 'Adviser updated successfully', adviser: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE adviser (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await execute('UPDATE advisers SET status = "inactive" WHERE id = ?', [id]);
    await execute('UPDATE sections SET adviser_id = NULL WHERE adviser_id = ?', [id]);
    res.json({ message: 'Adviser deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
