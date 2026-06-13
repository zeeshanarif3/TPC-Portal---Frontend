const Attendance = require('../models/Attendance');
const Contract = require('../models/Contract');
const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const Session = require('../models/Session');

// Get upcoming classes for a trainer (based on active contracts)
exports.getUpcomingClasses = async (req, res) => {
  try {
    const trainerId = req.user.id; // Assuming req.user is set by auth middleware

    // Find active contracts for the trainer
    const activeContracts = await Contract.find({ 
      trainerId, 
      status: 'active' 
    }).populate('sessionId');

    if (!activeContracts || activeContracts.length === 0) {
      return res.status(200).json([]);
    }

    // Get session IDs from active contracts
    const sessionIds = activeContracts.map(contract => contract.sessionId._id);

    // Find schedules for these sessions
    const schedules = await Schedule.find({ sessionId: { $in: sessionIds } })
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate');

    // For each schedule, we can format the slots
    const upcomingClasses = schedules.map(schedule => ({
      _id: schedule._id,
      course: {
        _id: schedule.courseId._id,
        courseCode: schedule.courseId.courseCode
      },
      session: {
        _id: schedule.sessionId._id,
        startDate: schedule.sessionId.startDate,
        endDate: schedule.sessionId.endDate
      },
      slots: schedule.slots
    }));

    res.status(200).json(upcomingClasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark attendance for a session on a date
exports.markAttendance = async (req, res) => {
  try {
    const { courseId, sessionId, date, startTime, endTime, presentStudents } = req.body;

    // Verify that the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: 'Course not found' });
    }

    // Verify that the session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(400).json({ message: 'Session not found' });
    }

    // Check if attendance already exists for this course, session, and date
    let attendance = await Attendance.findOne({ courseId, sessionId, date });

    if (attendance) {
      // Update existing attendance
      attendance.startTime = startTime;
      attendance.endTime = endTime;
      attendance.presentStudents = presentStudents;
      attendance.headCount = presentStudents.length;
    } else {
      // Create new attendance
      attendance = new Attendance({
        courseId,
        sessionId,
        date,
        startTime,
        endTime,
        presentStudents,
        headCount: presentStudents.length
      });
    }

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update attendance by ID
exports.updateAttendance = async (req, res) => {
  try {
    const { startTime, endTime, presentStudents } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { 
        startTime, 
        endTime, 
        presentStudents,
        headCount: presentStudents.length
      },
      { new: true, runValidators: true }
    );

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by ID
exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate');
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance records for a specific session and date (for moderator/admin)
exports.getAttendanceBySessionAndDate = async (req, res) => {
  try {
    const { sessionId, date } = req.query;

    if (!sessionId || !date) {
      return res.status(400).json({ message: 'Session ID and date are required' });
    }

    const attendance = await Attendance.findOne({ sessionId, date })
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate');

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found for the given session and date' });
    }
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
