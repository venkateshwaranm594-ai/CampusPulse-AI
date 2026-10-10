import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';

import { initDatabase } from './database/schema.js';
import { seedDatabase } from './database/seed.js';

import authRoutes from './routes/auth.js';
import settingsRoutes from './routes/settings.js';
import departmentRoutes from './routes/departments.js';
import sectionRoutes from './routes/sections.js';
import adviserRoutes from './routes/advisers.js';
import studentRoutes from './routes/students.js';
import attendanceRoutes from './routes/attendance.js';
import analyticsRoutes from './routes/analytics.js';
import flyerRoutes from './routes/flyers.js';
import quoteRoutes from './routes/quotes.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve frontend build files
const distDir = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CampusPulse AI', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CampusPulse AI Backend', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/advisers', adviserRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/flyers', flyerRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/upload', uploadRoutes);

// Catch-all route to serve React frontend index.html for non-API requests (e.g. GET /)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend build not found. Please run "npm run build".');
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server & Initialize Database
async function startServer(portToTry = PORT) {
  try {
    await initDatabase();
    await seedDatabase();

    const HOST = '0.0.0.0';
    const server = app.listen(portToTry, HOST, () => {
      console.log(`🚀 CampusPulse AI Backend running at http://${HOST}:${portToTry}`);
      console.log(`⚡ API ready for Smart Attendance & Daily Flyer generation.`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${portToTry} is occupied. Attempting port ${portToTry + 1}...`);
        startServer(Number(portToTry) + 1);
      } else {
        console.error('Server startup error:', err);
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
