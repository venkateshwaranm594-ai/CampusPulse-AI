import { execute } from './db.js';

export async function initDatabase() {
  console.log('🔄 Initializing Database Schema...');

  // 1. College Settings
  await execute(`
    CREATE TABLE IF NOT EXISTS college_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      college_name TEXT NOT NULL,
      logo_url TEXT,
      address TEXT,
      website TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      academic_year TEXT DEFAULT '2026-2027',
      principal_name TEXT DEFAULT 'Dr. R. Arumugam, Ph.D.',
      alert_threshold REAL DEFAULT 85.0
    );
  `);

  // 2. Users (Admin, Staff, Principal)
  await execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'staff', 'principal')) NOT NULL,
      department_id INTEGER,
      email TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Departments
  await execute(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active'
    );
  `);

  // 4. Advisers
  await execute(`
    CREATE TABLE IF NOT EXISTS advisers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      designation TEXT DEFAULT 'Assistant Professor',
      department_id INTEGER,
      FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL
    );
  `);

  // 5. Sections
  await execute(`
    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_id INTEGER NOT NULL,
      year_label TEXT NOT NULL,
      section_name TEXT NOT NULL,
      adviser_id INTEGER,
      FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE CASCADE,
      FOREIGN KEY(adviser_id) REFERENCES advisers(id) ON DELETE SET NULL,
      UNIQUE(department_id, year_label, section_name)
    );
  `);

  // 6. Students
  await execute(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roll_number TEXT UNIQUE NOT NULL,
      register_number TEXT UNIQUE NOT NULL,
      photo_url TEXT,
      gender TEXT CHECK(gender IN ('Male', 'Female')) NOT NULL,
      department_id INTEGER NOT NULL,
      year_label TEXT NOT NULL,
      section_id INTEGER NOT NULL,
      adviser_id INTEGER,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(department_id) REFERENCES departments(id),
      FOREIGN KEY(section_id) REFERENCES sections(id),
      FOREIGN KEY(adviser_id) REFERENCES advisers(id)
    );
  `);

  // 7. Attendance
  await execute(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      section_id INTEGER NOT NULL,
      attendance_date TEXT NOT NULL,
      status TEXT CHECK(status IN ('Present', 'Absent')) NOT NULL,
      reason TEXT DEFAULT NULL,
      custom_reason TEXT DEFAULT NULL,
      marked_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY(section_id) REFERENCES sections(id) ON DELETE CASCADE,
      UNIQUE(student_id, attendance_date)
    );
  `);

  // 8. Motivational Quotes
  await execute(`
    CREATE TABLE IF NOT EXISTS motivational_quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote TEXT NOT NULL,
      author TEXT DEFAULT 'CampusPulse',
      category TEXT DEFAULT 'general',
      active INTEGER DEFAULT 1
    );
  `);

  // 9. Flyers History
  await execute(`
    CREATE TABLE IF NOT EXISTS flyers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flyer_date TEXT NOT NULL,
      department_id INTEGER NOT NULL,
      year_label TEXT NOT NULL,
      section_id INTEGER NOT NULL,
      adviser_name TEXT,
      present_count INTEGER NOT NULL,
      absent_count INTEGER NOT NULL,
      total_count INTEGER NOT NULL,
      attendance_percentage REAL NOT NULL,
      theme TEXT DEFAULT 'modern',
      quote_used TEXT,
      flyer_image_data TEXT,
      generated_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(department_id) REFERENCES departments(id),
      FOREIGN KEY(section_id) REFERENCES sections(id)
    );
  `);

  console.log('✅ Database Schema Initialized Successfully!');

  // Ensure new columns exist for database schema migrations
  try { await execute('ALTER TABLE advisers ADD COLUMN photo_url TEXT'); } catch (e) {}
  try { await execute('ALTER TABLE advisers ADD COLUMN status TEXT DEFAULT "active"'); } catch (e) {}
  try { await execute('ALTER TABLE departments ADD COLUMN hod_name TEXT'); } catch (e) {}
  try { await execute('ALTER TABLE departments ADD COLUMN logo_url TEXT'); } catch (e) {}
  try { await execute('ALTER TABLE sections ADD COLUMN academic_year TEXT DEFAULT "2026-2027"'); } catch (e) {}
}
