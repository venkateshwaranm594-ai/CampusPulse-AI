import bcrypt from 'bcryptjs';
import { execute, query, getOne } from './db.js';
import { initDatabase } from './schema.js';

export async function seedDatabase() {
  await initDatabase();

  console.log('🌱 Seeding database with realistic demo data...');

  // 1. College Settings
  const existingSettings = await getOne('SELECT id FROM college_settings LIMIT 1');
  if (!existingSettings) {
    await execute(`
      INSERT INTO college_settings (
        college_name, logo_url, address, website, contact_email, contact_phone, academic_year, principal_name, alert_threshold
      ) VALUES (
        'No College Added',
        '',
        '',
        '',
        '',
        '',
        '2026-2027',
        '',
        85.0
      )
    `);
    console.log('  ✔ College settings initialized with empty state.');
  }

  // 2. Departments
  const deptList = [
    { name: 'Artificial Intelligence & Data Science', code: 'AI & DS', desc: 'Department of AI, Machine Learning & Big Data Analytics' },
    { name: 'Computer Science & Engineering', code: 'CSE', desc: 'Department of Software Engineering, Cloud & Security' },
    { name: 'Electronics & Communication Engg', code: 'ECE', desc: 'Department of VLSI, Embedded Systems & Signal Processing' },
    { name: 'Electrical & Electronics Engg', code: 'EEE', desc: 'Department of Power Systems, Smart Grids & Renewable Energy' },
    { name: 'Mechanical Engineering', code: 'Mechanical', desc: 'Department of Robotics, CAD/CAM & Automated Manufacturing' },
    { name: 'Civil Engineering', code: 'Civil', desc: 'Department of Structural, Environmental & Transportation Engg' },
    { name: 'Information Technology', code: 'IT', desc: 'Department of Web Technologies, Networking & Mobile Computing' },
    { name: 'Master of Business Admin', code: 'MBA', desc: 'Department of Management Studies & Financial Analytics' }
  ];

  for (const d of deptList) {
    const exists = await getOne('SELECT id FROM departments WHERE code = ?', [d.code]);
    if (!exists) {
      await execute('INSERT INTO departments (name, code, description) VALUES (?, ?, ?)', [d.name, d.code, d.desc]);
    }
  }
  console.log('  ✔ Departments seeded.');

  const depts = await query('SELECT * FROM departments');
  const deptMap = {};
  depts.forEach(d => { deptMap[d.code] = d.id; });

  // 3. Users
  const passHashAdmin = await bcrypt.hash('admin123', 10);
  const passHashStaff = await bcrypt.hash('staff123', 10);
  const passHashPrincipal = await bcrypt.hash('principal123', 10);

  const usersList = [
    { username: 'admin', pass: passHashAdmin, name: 'System Administrator', role: 'admin', dept: null, email: 'admin@campuspulse.edu.in' },
    { username: 'principal', pass: passHashPrincipal, name: 'Dr. R. Arumugam', role: 'principal', dept: null, email: 'principal@campuspulse.edu.in' },
    { username: 'staff_aids', pass: passHashStaff, name: 'Dr. M. Karthi', role: 'staff', dept: deptMap['AI & DS'], email: 'karthi.aids@campuspulse.edu.in' },
    { username: 'staff_cse', pass: passHashStaff, name: 'Prof. S. Divya', role: 'staff', dept: deptMap['CSE'], email: 'divya.cse@campuspulse.edu.in' },
    { username: 'staff_ece', pass: passHashStaff, name: 'Dr. R. Vignesh', role: 'staff', dept: deptMap['ECE'], email: 'vignesh.ece@campuspulse.edu.in' }
  ];

  for (const u of usersList) {
    const exists = await getOne('SELECT id FROM users WHERE username = ?', [u.username]);
    if (!exists) {
      await execute(`
        INSERT INTO users (username, password_hash, full_name, role, department_id, email)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [u.username, u.pass, u.name, u.role, u.dept, u.email]);
    }
  }
  console.log('  ✔ Users seeded (admin/admin123, principal/principal123, staff_aids/staff123).');

  // 4. Advisers
  const adviserList = [
    { name: 'Dr. M. Karthi', email: 'karthi@campuspulse.edu.in', phone: '9840123456', desig: 'Associate Professor & HOD', deptCode: 'AI & DS' },
    { name: 'Prof. S. Divya', email: 'divya@campuspulse.edu.in', phone: '9840123457', desig: 'Assistant Professor (Sr. Gr)', deptCode: 'AI & DS' },
    { name: 'Dr. R. Vignesh', email: 'vignesh@campuspulse.edu.in', phone: '9840123458', desig: 'Professor & Class Adviser', deptCode: 'CSE' },
    { name: 'Prof. P. Ananya', email: 'ananya@campuspulse.edu.in', phone: '9840123459', desig: 'Assistant Professor', deptCode: 'ECE' },
    { name: 'Dr. K. Suresh', email: 'suresh@campuspulse.edu.in', phone: '9840123460', desig: 'Associate Professor', deptCode: 'EEE' },
    { name: 'Prof. T. Priya', email: 'priya@campuspulse.edu.in', phone: '9840123461', desig: 'Assistant Professor', deptCode: 'IT' }
  ];

  for (const a of adviserList) {
    const exists = await getOne('SELECT id FROM advisers WHERE name = ?', [a.name]);
    if (!exists) {
      await execute(`
        INSERT INTO advisers (name, email, phone, designation, department_id)
        VALUES (?, ?, ?, ?, ?)
      `, [a.name, a.email, a.phone, a.desig, deptMap[a.deptCode] || depts[0].id]);
    }
  }
  const advisers = await query('SELECT * FROM advisers');

  // 5. Sections
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const secNames = ['Section A', 'Section B', 'Section C'];

  for (const d of depts) {
    for (const y of years) {
      for (const s of secNames) {
        const exists = await getOne(`
          SELECT id FROM sections WHERE department_id = ? AND year_label = ? AND section_name = ?
        `, [d.id, y, s]);
        if (!exists) {
          const adv = advisers[Math.floor(Math.random() * advisers.length)];
          await execute(`
            INSERT INTO sections (department_id, year_label, section_name, adviser_id)
            VALUES (?, ?, ?, ?)
          `, [d.id, y, s, adv.id]);
        }
      }
    }
  }
  console.log('  ✔ Sections seeded across departments & years.');

  // 6. Students
  const existingStudents = await getOne('SELECT COUNT(*) as count FROM students');
  if (existingStudents.count < 10) {
    const sampleNamesMale = [
      'Venkatesh Kumar', 'Aditya Sharma', 'Rohan Verma', 'Karthik Raja', 'Surya Prakash',
      'Arjun Das', 'Sanjay Ram', 'Gokul Krishnan', 'Pranav Nair', 'Dinesh Babu',
      'Naveen Pattabiraman', 'Vishal Anand', 'Varun Teja', 'Siddharth Roy', 'Ashwin Sundar'
    ];
    const sampleNamesFemale = [
      'Ananya Sundaram', 'Deepika Ramesh', 'Harini Iyer', 'Kavya Subramanian', 'Priyanka Menon',
      'Meera Nambiar', 'Shreya Viswanathan', 'Pavithra Rajan', 'Keerthana Swaminathan', 'Swetha Balan',
      'Aiswarya Reddy', 'Nandhini Natarajan', 'Janani Varma', 'Shruthi Ranganathan', 'Rakshitha Devi'
    ];

    const sections = await query('SELECT * FROM sections');

    let rollCounter = 101;
    for (const sec of sections) {
      // Create 6 to 10 students per section
      const count = 6 + Math.floor(Math.random() * 4);
      const dObj = depts.find(x => x.id === sec.department_id);
      const deptTag = dObj ? dObj.code.replace(/[^A-Z]/g, '').substring(0, 2) : 'AD';

      for (let i = 0; i < count; i++) {
        const isMale = i % 2 === 0;
        const nameList = isMale ? sampleNamesMale : sampleNamesFemale;
        const name = nameList[i % nameList.length] + (i >= nameList.length ? ` ${i}` : '');
        const gender = isMale ? 'Male' : 'Female';
        const rollNumber = `22${deptTag}${rollCounter}`;
        const regNumber = `312222${deptTag}${rollCounter + 500}`;
        rollCounter++;

        // Generate nice UI avatar SVG seed
        const photoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&gender=${gender.toLowerCase()}`;

        await execute(`
          INSERT INTO students (name, roll_number, register_number, photo_url, gender, department_id, year_label, section_id, adviser_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, rollNumber, regNumber, photoUrl, gender, sec.department_id, sec.year_label, sec.id, sec.adviser_id]);
      }
    }
    console.log('  ✔ Students seeded dynamically across all sections.');
  }

  // 7. Motivational Quotes
  const quotesList = [
    { quote: "Every day is a new opportunity to learn and grow beyond boundaries.", author: "CampusPulse Motivation" },
    { quote: "Be present today. Build your incredible future step by step tomorrow.", author: "Academic Excellence" },
    { quote: "Small consistent steps every day accumulate into massive achievements.", author: "Dr. A.P.J. Abdul Kalam" },
    { quote: "Your presence in class matters. Knowledge is built together.", author: "CampusPulse AI" },
    { quote: "Discipline is the bridge between college goals and career accomplishments.", author: "Jim Rohn" },
    { quote: "Attending today's session opens doors to tomorrow's innovations.", author: "Future Leader" },
    { quote: "Strive for progress, not perfection. Show up and shine!", author: "Campus Pulse Team" },
    { quote: "Success belongs to those who show up with curiosity every morning.", author: "Albert Einstein" },
    { quote: "Every lecture attended is a step closer to your dream career.", author: "Dean of Academics" },
    { quote: "Continuous effort—not strength or intelligence—is the key to unlocking potential.", author: "Winston Churchill" }
  ];

  for (const q of quotesList) {
    const exists = await getOne('SELECT id FROM motivational_quotes WHERE quote = ?', [q.quote]);
    if (!exists) {
      await execute('INSERT INTO motivational_quotes (quote, author) VALUES (?, ?)', [q.quote, q.author]);
    }
  }
  console.log('  ✔ Motivational quotes seeded.');

  // 8. Past Attendance Records for analytics & flyer preview
  const dates = ['2026-10-09', '2026-10-08', '2026-10-07'];
  const reasons = ['Fever', 'Medical', 'Personal Issues', 'On Duty', 'Family Reason', 'Emergency'];
  const allStudents = await query('SELECT * FROM students');

  for (const date of dates) {
    for (const student of allStudents) {
      const exists = await getOne(`
        SELECT id FROM attendance WHERE student_id = ? AND attendance_date = ?
      `, [student.id, date]);

      if (!exists) {
        // ~90% present rate, ~10% absent rate
        const isAbsent = Math.random() < 0.12;
        const status = isAbsent ? 'Absent' : 'Present';
        const reason = isAbsent ? reasons[Math.floor(Math.random() * reasons.length)] : null;

        await execute(`
          INSERT INTO attendance (student_id, section_id, attendance_date, status, reason, marked_by)
          VALUES (?, ?, ?, ?, ?, 'System Seed')
        `, [student.id, student.section_id, date, status, reason]);
      }
    }
  }
  console.log('  ✔ Attendance history seeded for recent dates.');

  console.log('🎉 Database seeding completed successfully!');
}

// Run directly if called from CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
