# 🚀 CampusPulse AI – Smart Attendance & Daily Absence Flyer

> **"Turn Attendance Into Insight."**

CampusPulse AI is a production-ready, intelligent college attendance communication and analytics platform. Instead of acting like a basic CRUD website, CampusPulse AI transforms daily digital attendance records into **high-impact, social-media-ready automated daily flyers** and **executive principal dashboards** with gender-wise intelligence.

---

## 🌟 Key Product Features

### 1. ✨ One-Click AI Daily Absence Flyer Generator (Core Unique Feature)
- **Zero Manual Typing**: Staff select `Department → Academic Year → Section → Date`, click **"✨ Generate Today's AI Flyer"**, and the system instantly pulls attendance data, absent photos, roll numbers, register numbers, absence reasons, gender stats, and class adviser signatures.
- **5 Creative Themes**:
  1. *Modern Corporate*: Sleek deep indigo canvas with golden/cyan accents.
  2. *College Premium*: Luxury emerald crest academic aesthetic with serif headings.
  3. *Minimal Academic*: Clean high-contrast monochrome design.
  4. *Dark AI Cyber*: Futuristic dark glowing neon cyan/violet canvas.
  5. *Festival / Special Day*: Warm celebratory gradient header for special events.
- **Adaptive Layout Engine**: Automatically adjusts card sizing and pagination based on the number of absent students (e.g., 1-3 hero cards, 4-12 grid cards, 13-30+ paginated cards so no cards overflow!).
- **High-Resolution Export**: Download as PNG, JPG, PDF, Copy Image directly to clipboard, or Share to WhatsApp/Notice boards.
- **Rotating Motivational Quote System**: Auto-attaches an inspirational quote to every flyer, preventing daily repetition.

### 2. 🏛️ College-Wide Department Hierarchy & Management
- Dynamic support for all college departments (AI & DS, CSE, ECE, EEE, Mechanical, Civil, IT, MBA, etc.).
- Department → Academic Year (1st - 4th Year) → Section (Sec A, B, C) → Adviser → Student.
- Admin portal to add/edit/deactivate departments, manage sections, register faculty advisers, and upload student photo rosters.

### 3. 📊 Executive Principal / Management Dashboard
- **College-Wide Metrics**: Total Enrolled, Present Today, Absent Today, Overall Attendance Rate (%).
- **Highlights Banner**: Highlights the Highest Attendance Department, Lowest Attendance Department, and Highest Absence Count Department.
- **Gender-Wise Intelligence**: Automated computation for **Boys (Total, Present, Absent, %)** and **Girls (Total, Present, Absent, %)**.
- **Interactive Department Grid**: Real-time cards for all departments with visual progress bars and alert badges when below benchmark thresholds.
- **AI Smart Insight Engine**: Natural language text summary highlighting attendance trends and medical/OD reasons.
- **7-Day Attendance Trend Line**: Historical visual tracking of college attendance velocity.

### 4. 📋 Staff Attendance Marking Portal
- Fast batch attendance marking ("Mark All Present", "Mark All Absent").
- Absence reason tagging: *Fever, Medical, Personal Issues, On Duty, Family Reason, Emergency, Other (custom text)*.
- Unique Database Rule: `(student_id, attendance_date)` constraint ensures no duplicate entries exist for any date.

### 5. 📁 Flyer Archive & History
- Complete historical record of all generated flyers stored by date, department, year, section, and adviser.
- Ability to reopen, preview, and re-export past flyers anytime.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, html2canvas, jsPDF, Canvas-Confetti.
- **Backend**: Node.js, Express.js, RESTful API architecture.
- **Database**: SQLite with `sqlite3` driver (persisted at `backend/data/campuspulse.db`), ready for seamless migration to PostgreSQL.
- **Authentication**: JWT authentication with role-based access control (`admin`, `staff`, `principal`).

---

## 🚀 Quick Start Guide

### 1. Start the Backend API Server
```bash
cd backend
npm start
```
*The backend server will run on `http://localhost:5000` and automatically initialize the database schema and seed realistic demo data.*

### 2. Start the Frontend Development Server
```bash
cd frontend
npm run dev -- --port 3000
```
*Open `http://localhost:3000` in your web browser.*

---

## 🔐 Demo Credentials

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Staff (AI & DS)** | `staff_aids` | `staff123` | Mark attendance, generate & download daily flyers |
| **Principal** | `principal` | `principal123` | College-wide executive dashboard, gender analytics & highlights |
| **Admin** | `admin` | `admin123` | Manage departments, sections, advisers, students & college settings |

---

## 📂 Project Structure

```
campuspulse-ai/
├── backend/
│   ├── data/                 # SQLite database storage (campuspulse.db)
│   ├── uploads/              # Static uploads for logos and photos
│   ├── src/
│   │   ├── database/         # db.js, schema.js, seed.js
│   │   ├── routes/           # auth, settings, departments, sections, advisers, students, attendance, analytics, flyers, quotes, upload
│   │   └── index.js          # Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, PrincipalDashboard, StaffAttendance, AIFlyerGenerator, FlyerHistory, AdminPanel, LoginModal
│   │   ├── App.jsx           # Root layout & tab router
│   │   ├── index.css         # Design system & dark mode tokens
│   │   └── main.jsx
│   ├── vite.config.js        # Vite dev server & API proxy
│   └── package.json
│
```
└── README.md
```

---

## 🌐 Render Deployment Guide

Follow these steps to deploy CampusPulse AI as a Web Service on [Render](https://render.com/):

### 1. Render Service Configuration

- **Environment**: `Node`
- **Build Command**:
  ```bash
  npm run build
  ```
- **Start Command**:
  ```bash
  npm start
  ```
- **Health Check Path**: `/health`

### 2. Required Environment Variables

Set the following environment variables in the Render dashboard:

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables production mode & static asset serving |
| `PORT` | Auto (Render) | `10000` | Render assigns this dynamically (read by backend via `process.env.PORT`) |
| `JWT_SECRET` | Recommended | `your_secret_key` | Secret key used to sign JWT authentication tokens |
| `DB_PATH` | Optional | `/var/data/campuspulse.db` | Path to SQLite database file (use with Render Persistent Disk) |
| `UPLOADS_DIR` | Optional | `/var/data/uploads` | Path to file uploads directory (use with Render Persistent Disk) |

### 3. Persistent Storage Requirements (SQLite & Photo Uploads)

By default, Render web service instances are ephemeral (restarted on deploys). To ensure student photos, college logos, and attendance database records persist across restarts:

1. In Render, attach a **Persistent Disk** to your Web Service.
2. Set **Mount Path** to `/var/data`.
3. Set environment variables:
   - `DB_PATH=/var/data/campuspulse.db`
   - `UPLOADS_DIR=/var/data/uploads`

---

## 🔐 Demo Credentials

| Role | Username | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Staff (AI & DS)** | `staff_aids` | `staff123` | Mark attendance, generate & download daily flyers |
| **Principal** | `principal` | `principal123` | College-wide executive dashboard, gender analytics & highlights |
| **Admin** | `admin` | `admin123` | Manage departments, sections, advisers, students & college settings |

