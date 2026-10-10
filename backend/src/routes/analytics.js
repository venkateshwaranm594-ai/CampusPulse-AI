import express from 'express';
import { query, getOne } from '../database/db.js';

const router = express.Router();

// GET Principal College-wide Analytics
router.get('/principal', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Settings
    const settings = await getOne('SELECT * FROM college_settings LIMIT 1');
    const alertThreshold = settings?.alert_threshold || 85.0;

    // Get all departments
    const departments = await query(`
      SELECT * FROM departments WHERE status = 'active' ORDER BY code ASC
    `);

    let collegeTotal = 0;
    let collegePresent = 0;
    let collegeAbsent = 0;

    let collegeBoysTotal = 0;
    let collegeBoysPresent = 0;
    let collegeBoysAbsent = 0;

    let collegeGirlsTotal = 0;
    let collegeGirlsPresent = 0;
    let collegeGirlsAbsent = 0;

    const deptStats = [];

    for (const d of departments) {
      // Fetch students in department
      const students = await query(`
        SELECT s.id, s.gender, COALESCE(att.status, 'Present') as status
        FROM students s
        LEFT JOIN attendance att ON s.id = att.student_id AND att.attendance_date = ?
        WHERE s.department_id = ? AND s.status = 'active'
      `, [targetDate, d.id]);

      let dTotal = students.length;
      let dPresent = 0;
      let dAbsent = 0;

      let dBoysTotal = 0, dBoysPresent = 0, dBoysAbsent = 0;
      let dGirlsTotal = 0, dGirlsPresent = 0, dGirlsAbsent = 0;

      students.forEach(st => {
        const isPresent = st.status === 'Present';
        if (isPresent) dPresent++;
        else dAbsent++;

        if (st.gender === 'Male') {
          dBoysTotal++;
          if (isPresent) dBoysPresent++;
          else dBoysAbsent++;
        } else if (st.gender === 'Female') {
          dGirlsTotal++;
          if (isPresent) dGirlsPresent++;
          else dGirlsAbsent++;
        }
      });

      const dPercentage = dTotal > 0 ? parseFloat(((dPresent / dTotal) * 100).toFixed(1)) : 0;
      const dBoysPct = dBoysTotal > 0 ? parseFloat(((dBoysPresent / dBoysTotal) * 100).toFixed(1)) : 0;
      const dGirlsPct = dGirlsTotal > 0 ? parseFloat(((dGirlsPresent / dGirlsTotal) * 100).toFixed(1)) : 0;

      collegeTotal += dTotal;
      collegePresent += dPresent;
      collegeAbsent += dAbsent;

      collegeBoysTotal += dBoysTotal;
      collegeBoysPresent += dBoysPresent;
      collegeBoysAbsent += dBoysAbsent;

      collegeGirlsTotal += dGirlsTotal;
      collegeGirlsPresent += dGirlsPresent;
      collegeGirlsAbsent += dGirlsAbsent;

      deptStats.push({
        id: d.id,
        name: d.name,
        code: d.code,
        total: dTotal,
        present: dPresent,
        absent: dAbsent,
        attendance_percentage: dPercentage,
        is_below_threshold: dPercentage < alertThreshold && dTotal > 0,
        boys: {
          total: dBoysTotal,
          present: dBoysPresent,
          absent: dBoysAbsent,
          percentage: dBoysPct
        },
        girls: {
          total: dGirlsTotal,
          present: dGirlsPresent,
          absent: dGirlsAbsent,
          percentage: dGirlsPct
        }
      });
    }

    const overallPercentage = collegeTotal > 0 ? parseFloat(((collegePresent / collegeTotal) * 100).toFixed(1)) : 0;
    const overallBoysPct = collegeBoysTotal > 0 ? parseFloat(((collegeBoysPresent / collegeBoysTotal) * 100).toFixed(1)) : 0;
    const overallGirlsPct = collegeGirlsTotal > 0 ? parseFloat(((collegeGirlsPresent / collegeGirlsTotal) * 100).toFixed(1)) : 0;

    // Highest / Lowest / Most Absent department highlights
    const validDepts = deptStats.filter(x => x.total > 0);

    let highestAttendanceDept = null;
    let lowestAttendanceDept = null;
    let highestAbsenceDept = null;

    if (validDepts.length > 0) {
      const sortedByPct = [...validDepts].sort((a, b) => b.attendance_percentage - a.attendance_percentage);
      highestAttendanceDept = sortedByPct[0];
      lowestAttendanceDept = sortedByPct[sortedByPct.length - 1];

      const sortedByAbsent = [...validDepts].sort((a, b) => b.absent - a.absent);
      highestAbsenceDept = sortedByAbsent[0];
    }

    res.json({
      date: targetDate,
      overall: {
        total: collegeTotal,
        present: collegePresent,
        absent: collegeAbsent,
        attendance_percentage: overallPercentage,
        boys: {
          total: collegeBoysTotal,
          present: collegeBoysPresent,
          absent: collegeBoysAbsent,
          percentage: overallBoysPct
        },
        girls: {
          total: collegeGirlsTotal,
          present: collegeGirlsPresent,
          absent: collegeGirlsAbsent,
          percentage: overallGirlsPct
        }
      },
      highlights: {
        highest_attendance: highestAttendanceDept ? { code: highestAttendanceDept.code, pct: highestAttendanceDept.attendance_percentage } : null,
        lowest_attendance: lowestAttendanceDept ? { code: lowestAttendanceDept.code, pct: lowestAttendanceDept.attendance_percentage } : null,
        highest_absence: highestAbsenceDept ? { code: highestAbsenceDept.code, absent: highestAbsenceDept.absent } : null
      },
      departments: deptStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET AI Attendance Insights summary
router.get('/insights', async (req, res) => {
  try {
    const { department_id, section_id, date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    let queryCondition = '1=1';
    const params = [];
    if (department_id) {
      queryCondition += ' AND s.department_id = ?';
      params.push(department_id);
    }
    if (section_id) {
      queryCondition += ' AND s.section_id = ?';
      params.push(section_id);
    }

    const students = await query(`
      SELECT s.name, s.gender, COALESCE(att.status, 'Present') as status, att.reason
      FROM students s
      LEFT JOIN attendance att ON s.id = att.student_id AND att.attendance_date = ?
      WHERE ${queryCondition} AND s.status = 'active'
    `, [targetDate, ...params]);

    const total = students.length;
    const absents = students.filter(s => s.status === 'Absent');
    const absentCount = absents.length;
    const presentCount = total - absentCount;
    const pct = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 100;

    const medicalCount = absents.filter(a => a.reason === 'Medical' || a.reason === 'Fever').length;
    const onDutyCount = absents.filter(a => a.reason === 'On Duty').length;

    let insightText = `Target cohort attendance stands at ${pct}% for ${targetDate}. Out of ${total} students, ${presentCount} are present and ${absentCount} absent.`;
    if (medicalCount > 0) {
      insightText += ` Note: ${medicalCount} student(s) reported health/medical reasons.`;
    }
    if (onDutyCount > 0) {
      insightText += ` ${onDutyCount} student(s) are officially on OD (On Duty).`;
    }

    if (parseFloat(pct) >= 95) {
      insightText += ` Exceptional engagement observed today! ✨`;
    } else if (parseFloat(pct) < 85) {
      insightText += ` ⚠ Attendance is below the benchmark threshold. Advisory alert triggered.`;
    }

    res.json({
      date: targetDate,
      insight: insightText,
      stats: { total, present: presentCount, absent: absentCount, percentage: parseFloat(pct) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Attendance Trends
router.get('/trends', async (req, res) => {
  try {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const trendData = [];
    for (const d of dates.reverse()) {
      const row = await getOne(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
          SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absent
        FROM attendance
        WHERE attendance_date = ?
      `, [d]);

      const total = row?.total || 0;
      const present = row?.present || 0;
      const pct = total > 0 ? parseFloat(((present / total) * 100).toFixed(1)) : 90.0;

      trendData.push({
        date: d,
        present,
        absent: row?.absent || 0,
        percentage: pct
      });
    }

    res.json(trendData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
