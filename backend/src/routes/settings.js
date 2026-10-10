import express from 'express';
import { getOne, execute } from '../database/db.js';

const router = express.Router();

// GET settings
router.get('/', async (req, res) => {
  try {
    const settings = await getOne('SELECT * FROM college_settings ORDER BY id ASC LIMIT 1');
    res.json(settings || {
      college_name: 'No College Added',
      logo_url: '',
      address: '',
      website: '',
      contact_email: '',
      contact_phone: '',
      academic_year: '2026-2027',
      principal_name: '',
      alert_threshold: 85.0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update settings
router.put('/', async (req, res) => {
  try {
    const {
      college_name, logo_url, address, website,
      contact_email, contact_phone, academic_year,
      principal_name, alert_threshold
    } = req.body;

    const existing = await getOne('SELECT id FROM college_settings LIMIT 1');

    if (existing) {
      await execute(`
        UPDATE college_settings SET
          college_name = ?, logo_url = ?, address = ?, website = ?,
          contact_email = ?, contact_phone = ?, academic_year = ?,
          principal_name = ?, alert_threshold = ?
        WHERE id = ?
      `, [
        college_name, logo_url, address, website,
        contact_email, contact_phone, academic_year,
        principal_name, parseFloat(alert_threshold || 85.0),
        existing.id
      ]);
    } else {
      await execute(`
        INSERT INTO college_settings (
          college_name, logo_url, address, website, contact_email, contact_phone, academic_year, principal_name, alert_threshold
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        college_name, logo_url, address, website,
        contact_email, contact_phone, academic_year,
        principal_name, parseFloat(alert_threshold || 85.0)
      ]);
    }

    const updated = await getOne('SELECT * FROM college_settings LIMIT 1');
    res.json({ message: 'Settings updated successfully', settings: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
