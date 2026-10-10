import express from 'express';
import { query, getOne, execute } from '../database/db.js';

const router = express.Router();

// POST generate AI Flyer data for a section + date
router.post('/generate', async (req, res) => {
  try {
    const { section_id, attendance_date, theme } = req.body;

    if (!section_id || !attendance_date) {
      return res.status(400).json({ error: 'section_id and attendance_date are required' });
    }

    // 1. College Settings
    const settings = await getOne('SELECT * FROM college_settings LIMIT 1');

    // 2. Section & Adviser info
    const section = await getOne(`
      SELECT sec.*, 
        d.name as department_name, d.code as department_code, d.id as department_id,
        a.name as adviser_name, a.photo_url as adviser_photo, a.designation as adviser_designation
      FROM sections sec
      JOIN departments d ON sec.department_id = d.id
      LEFT JOIN advisers a ON sec.adviser_id = a.id
      WHERE sec.id = ?
    `, [section_id]);

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // 3. Students & Attendance for target date
    const students = await query(`
      SELECT s.*, 
        COALESCE(att.status, 'Present') as attendance_status,
        att.reason as absence_reason,
        att.custom_reason
      FROM students s
      LEFT JOIN attendance att ON s.id = att.student_id AND att.attendance_date = ?
      WHERE s.section_id = ? AND s.status = 'active'
      ORDER BY s.roll_number ASC
    `, [attendance_date, section_id]);

    const totalCount = students.length;
    let presentCount = 0;
    let absentCount = 0;
    let onDutyCount = 0;

    let boysTotal = 0, boysPresent = 0, boysAbsent = 0, boysOD = 0;
    let girlsTotal = 0, girlsPresent = 0, girlsAbsent = 0, girlsOD = 0;

    const absentStudents = [];
    const onDutyStudents = [];

    students.forEach((st) => {
      const status = st.attendance_status;
      const reasonStr = (st.custom_reason || st.absence_reason || '').trim();
      const reasonLower = reasonStr.toLowerCase();

      const isOnDuty = status === 'On Duty' || reasonLower.includes('on duty') || reasonLower.includes('od');
      const isAbsent = status === 'Absent' && !isOnDuty;
      const isPresent = !isAbsent && !isOnDuty;

      const studentObj = {
        id: st.id,
        name: st.name,
        roll_number: st.roll_number,
        register_number: st.register_number,
        photo_url: st.photo_url || '',
        gender: st.gender,
        scholar_status: st.roll_number?.endsWith('H') ? 'Hosteller' : 'Day Scholar',
        informed: reasonStr ? 'Informed' : 'Uninformed',
        reason: reasonStr || (isOnDuty ? 'On Duty' : 'Not Specified')
      };

      if (isOnDuty) {
        onDutyCount++;
        onDutyStudents.push({ ...studentObj, s_no: onDutyStudents.length + 1 });
      } else if (isAbsent) {
        absentCount++;
        absentStudents.push({ ...studentObj, s_no: absentStudents.length + 1 });
      } else {
        presentCount++;
      }

      if (st.gender === 'Male') {
        boysTotal++;
        if (isPresent) boysPresent++;
        else if (isOnDuty) boysOD++;
        else boysAbsent++;
      } else if (st.gender === 'Female') {
        girlsTotal++;
        if (isPresent) girlsPresent++;
        else if (isOnDuty) girlsOD++;
        else girlsAbsent++;
      }
    });

    const effectivePresent = presentCount + onDutyCount;
    const attendancePercentage = totalCount > 0 ? parseFloat(((effectivePresent / totalCount) * 100).toFixed(1)) : 0;

    // 4. Select rotating motivational quote
    const quotes = await query('SELECT * FROM motivational_quotes WHERE active = 1');
    let selectedQuote = "Every day is a new opportunity to learn and grow.";
    if (quotes.length > 0) {
      const dateCharSum = attendance_date.split('-').reduce((acc, curr) => acc + parseInt(curr), 0);
      const index = dateCharSum % quotes.length;
      selectedQuote = quotes[index].quote;
    }

    const flyerData = {
      college: {
        name: settings?.college_name || 'No College Added',
        logo_url: settings?.logo_url || '',
        principal: settings?.principal_name || ''
      },
      department: {
        id: section.department_id,
        name: section.department_name,
        code: section.department_code
      },
      class_info: {
        year: section.year_label,
        section: section.section_name,
        academic_year: section.academic_year || '2026-2027',
        adviser_name: section.adviser_name || 'Class Adviser',
        adviser_photo: section.adviser_photo || '',
        adviser_designation: section.adviser_designation || 'Assistant Professor'
      },
      date: attendance_date,
      theme: theme || 'modern',
      statistics: {
        total: totalCount,
        present: presentCount,
        absent: absentCount,
        on_duty: onDutyCount,
        percentage: attendancePercentage,
        boys: { total: boysTotal, present: boysPresent, absent: boysAbsent, on_duty: boysOD },
        girls: { total: girlsTotal, present: girlsPresent, absent: girlsAbsent, on_duty: girlsOD }
      },
      absent_students: absentStudents,
      on_duty_students: onDutyStudents,
      quote: selectedQuote
    };

    res.json(flyerData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save generated flyer to history
router.post('/save', async (req, res) => {
  try {
    const {
      flyer_date, department_id, year_label, section_id,
      adviser_name, present_count, absent_count, total_count,
      attendance_percentage, theme, quote_used, flyer_image_data, generated_by
    } = req.body;

    const result = await execute(`
      INSERT INTO flyers (
        flyer_date, department_id, year_label, section_id,
        adviser_name, present_count, absent_count, total_count,
        attendance_percentage, theme, quote_used, flyer_image_data, generated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      flyer_date, department_id, year_label, section_id,
      adviser_name || 'Adviser', present_count, absent_count, total_count,
      attendance_percentage, theme || 'modern', quote_used || '',
      flyer_image_data || null, generated_by || 'Staff'
    ]);

    res.status(201).json({ message: 'Flyer saved to history', flyer_id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET flyer history
router.get('/history', async (req, res) => {
  try {
    const { department_id, year_label, section_id, date } = req.query;

    let sql = `
      SELECT f.*, 
        d.name as department_name, d.code as department_code,
        sec.section_name
      FROM flyers f
      JOIN departments d ON f.department_id = d.id
      JOIN sections sec ON f.section_id = sec.id
    `;
    const conditions = [];
    const params = [];

    if (department_id) {
      conditions.push('f.department_id = ?');
      params.push(department_id);
    }
    if (year_label) {
      conditions.push('f.year_label = ?');
      params.push(year_label);
    }
    if (section_id) {
      conditions.push('f.section_id = ?');
      params.push(section_id);
    }
    if (date) {
      conditions.push('f.flyer_date = ?');
      params.push(date);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY f.created_at DESC LIMIT 50';

    const history = await query(sql, params);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
