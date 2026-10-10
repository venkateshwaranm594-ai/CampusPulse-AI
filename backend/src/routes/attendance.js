import express from 'express';
import { query, getOne, execute } from '../database/db.js';

const router = express.Router();

// GET attendance sheet & stats for a specific section and date
router.get('/', async (req, res) => {
  try {
    const { section_id, attendance_date } = req.query;

    if (!section_id || !attendance_date) {
      return res.status(400).json({ error: 'section_id and attendance_date parameters are required' });
    }

    // Get section and department info
    const section = await getOne(`
      SELECT sec.*, 
        d.name as department_name, d.code as department_code,
        a.name as adviser_name
      FROM sections sec
      JOIN departments d ON sec.department_id = d.id
      LEFT JOIN advisers a ON sec.adviser_id = a.id
      WHERE sec.id = ?
    `, [section_id]);

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Fetch all active students in this section with their attendance status for this date
    const students = await query(`
      SELECT s.*, 
        COALESCE(att.status, 'Present') as attendance_status,
        att.reason as absence_reason,
        att.custom_reason as custom_reason,
        att.id as attendance_record_id
      FROM students s
      LEFT JOIN attendance att ON s.id = att.student_id AND att.attendance_date = ?
      WHERE s.section_id = ? AND s.status = 'active'
      ORDER BY s.roll_number ASC
    `, [attendance_date, section_id]);

    // Calculate metrics
    const totalStudents = students.length;
    let presentCount = 0;
    let absentCount = 0;

    let totalBoys = 0;
    let presentBoys = 0;
    let absentBoys = 0;

    let totalGirls = 0;
    let presentGirls = 0;
    let absentGirls = 0;

    students.forEach(st => {
      const isPresent = st.attendance_status === 'Present';
      if (isPresent) presentCount++;
      else absentCount++;

      if (st.gender === 'Male') {
        totalBoys++;
        if (isPresent) presentBoys++;
        else absentBoys++;
      } else if (st.gender === 'Female') {
        totalGirls++;
        if (isPresent) presentGirls++;
        else absentGirls++;
      }
    });

    const overallPercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;
    const boysPercentage = totalBoys > 0 ? ((presentBoys / totalBoys) * 100).toFixed(1) : 0;
    const girlsPercentage = totalGirls > 0 ? ((presentGirls / totalGirls) * 100).toFixed(1) : 0;

    res.json({
      section,
      attendance_date,
      summary: {
        total_students: totalStudents,
        present: presentCount,
        absent: absentCount,
        attendance_percentage: parseFloat(overallPercentage),
        boys: {
          total: totalBoys,
          present: presentBoys,
          absent: absentBoys,
          percentage: parseFloat(boysPercentage)
        },
        girls: {
          total: totalGirls,
          present: presentGirls,
          absent: absentGirls,
          percentage: parseFloat(girlsPercentage)
        }
      },
      students
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save/update bulk attendance for a date & section
router.post('/mark', async (req, res) => {
  try {
    const { section_id, attendance_date, records, marked_by } = req.body;

    if (!section_id || !attendance_date || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid payload: section_id, attendance_date, and records array required' });
    }

    const staffName = marked_by || 'Staff Member';

    for (const item of records) {
      const { student_id, status, reason, custom_reason } = item;
      const isOD = status === 'On Duty' || (reason || '').toLowerCase().includes('on duty') || (custom_reason || '').toLowerCase().includes('on duty');
      const statusVal = status === 'Present' && !isOD ? 'Present' : 'Absent';
      const reasonVal = isOD ? (reason || 'On Duty') : ((statusVal === 'Absent') ? (reason || 'Personal') : null);
      const customReasonVal = (statusVal === 'Absent' || isOD) ? (custom_reason || null) : null;

      // SQLite Upsert using ON CONFLICT(student_id, attendance_date)
      await execute(`
        INSERT INTO attendance (student_id, section_id, attendance_date, status, reason, custom_reason, marked_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(student_id, attendance_date) DO UPDATE SET
          status = excluded.status,
          reason = excluded.reason,
          custom_reason = excluded.custom_reason,
          marked_by = excluded.marked_by,
          created_at = CURRENT_TIMESTAMP
      `, [student_id, section_id, attendance_date, statusVal, reasonVal, customReasonVal, staffName]);
    }

    res.json({ message: `Attendance marked successfully for ${records.length} students on ${attendance_date}` });
  } catch (err) {
    console.error('Error saving attendance:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET attendance historical summary records grouped by date and section
router.get('/records', async (req, res) => {
  try {
    const { department_id, year_label, section_id, attendance_date } = req.query;

    let sql = `
      SELECT 
        att.attendance_date,
        sec.id as section_id, sec.section_name, sec.year_label,
        d.id as department_id, d.name as department_name, d.code as department_code,
        COUNT(att.id) as total_records,
        SUM(CASE WHEN att.status = 'Present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN att.status = 'Absent' THEN 1 ELSE 0 END) as absent_count
      FROM attendance att
      JOIN sections sec ON att.section_id = sec.id
      JOIN departments d ON sec.department_id = d.id
    `;
    const conditions = [];
    const params = [];

    if (department_id) {
      conditions.push('d.id = ?');
      params.push(department_id);
    }
    if (year_label) {
      conditions.push('sec.year_label = ?');
      params.push(year_label);
    }
    if (section_id) {
      conditions.push('sec.id = ?');
      params.push(section_id);
    }
    if (attendance_date) {
      conditions.push('att.attendance_date = ?');
      params.push(attendance_date);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY att.attendance_date, sec.id ORDER BY att.attendance_date DESC LIMIT 100';

    const records = await query(sql, params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
