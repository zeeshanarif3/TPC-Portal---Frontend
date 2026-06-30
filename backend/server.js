const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const seedAdmin = require('./config/seedAdmin')

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)


.then(async () => {
  console.log('MongoDB connected');
  await seedAdmin();
})
.catch(err => console.log('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const collegeRoutes = require('./routes/colleges');
const trainerRoutes = require('./routes/trainers');
const courseRoutes = require('./routes/courses');
const studentRoutes = require('./routes/students');
const sessionRoutes = require('./routes/sessions');
const contractRoutes = require('./routes/contracts');
const scheduleRoutes = require('./routes/schedules');
const attendanceRoutes = require('./routes/attendance');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'TPC Backend API is running' });
});

// 404 Fallback Route (Added: Catch-all for routes that don't exist)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
