import express from 'express';
import { query, getOne, execute } from '../database/db.js';

const router = express.Router();

// GET all quotes
router.get('/', async (req, res) => {
  try {
    const quotes = await query('SELECT * FROM motivational_quotes ORDER BY id DESC');
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add quote
router.post('/', async (req, res) => {
  try {
    const { quote, author, category } = req.body;
    if (!quote) {
      return res.status(400).json({ error: 'Quote text is required' });
    }

    const result = await execute(`
      INSERT INTO motivational_quotes (quote, author, category)
      VALUES (?, ?, ?)
    `, [quote, author || 'CampusPulse', category || 'general']);

    const newQ = await getOne('SELECT * FROM motivational_quotes WHERE id = ?', [result.lastID]);
    res.status(201).json({ message: 'Quote created successfully', quote: newQ });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update quote
router.put('/:id', async (req, res) => {
  try {
    const { quote, author, category, active } = req.body;
    const { id } = req.params;

    await execute(`
      UPDATE motivational_quotes SET quote = ?, author = ?, category = ?, active = ?
      WHERE id = ?
    `, [quote, author, category, active !== undefined ? (active ? 1 : 0) : 1, id]);

    const updated = await getOne('SELECT * FROM motivational_quotes WHERE id = ?', [id]);
    res.json({ message: 'Quote updated successfully', quote: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE quote
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await execute('DELETE FROM motivational_quotes WHERE id = ?', [id]);
    res.json({ message: 'Quote deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
