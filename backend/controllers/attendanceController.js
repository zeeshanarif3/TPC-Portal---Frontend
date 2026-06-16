const Attendance = require('../models/Attendance');
const Contract = require('../models/Contract');
const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const Session = require('../models/Session');
const College = require('../models/College');
const User = require('../models/User');

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

// Create attendance record (if not exists)
exports.createAttendance = async (req, res) => {
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
    const existingAttendance = await Attendance.findOne({ courseId, sessionId, date });
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance record already exists for this course, session, and date' });
    }

    // Create new attendance
    const attendance = new Attendance({
      courseId,
      sessionId,
      date,
      startTime,
      endTime,
      presentStudents,
      headCount: presentStudents.length
    });

    await attendance.save();
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update attendance record (must exist)
exports.updateAttendance = async (req, res) => {
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

    // Find the attendance record for this course, session, and date
    const attendance = await Attendance.findOne({ courseId, sessionId, date });
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found for the given course, session, and date' });
    }

    // Update the attendance record
    attendance.startTime = startTime;
    attendance.endTime = endTime;
    attendance.presentStudents = presentStudents;
    attendance.headCount = presentStudents.length;

    await attendance.save();
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance by ID (for admin/moderator if needed)
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

// Get analytics/overview for a moderator's college
exports.getAnalytics = async (req, res) => {
  try {
    const moderatorId = req.user.id; // The logged-in moderator's user ID

    // Find the college where this user is the moderator
    const college = await College.findOne({ moderatorId });
    if (!college) {
      return res.status(404).json({ message: 'College not found for this moderator' });
    }

    // Get all sessions for this college
    const sessions = await Session.find({ collegeId: college._id });

    // Get all courses for this college (via sessions or directly? We can get courses via collegeId in Course model)
    const courses = await Course.find({ collegeId: college._id });

    // Get all trainers for this college? Not directly linked, but we can get trainers who have contracts in sessions of this college.
    // For simplicity, we'll get:
    // - Total sessions
    // - Total courses
    // - Total students (via courses)
    // - Total attendance records (for sessions in this college)

    // Total students: sum of students in each course of this college
    let totalStudents = 0;
    for (const course of courses) {
      const studentCount = await Student.countDocuments({ courseId: course._id });
      totalStudents += studentCount;
    }

    // Total attendance records for sessions in this college
    const sessionIds = sessions.map(s => s._id);
    const totalAttendanceRecords = await Attendance.countDocuments({ sessionId: { $in: sessionIds } });

    // We can also get:
    // - Number of active contracts in this college's sessions
    const activeContracts = await Contract.countDocuments({
      sessionId: { $in: sessionIds },
      status: 'active'
    });

    res.status(200).json({
      college: {
        _id: college._id,
        name: college.name,
        pointOfContact: college.pointOfContact,
        location: college.location
      },
      statistics: {
        totalSessions: sessions.length,
        totalCourses: courses.length,
        totalStudents,
        totalAttendanceRecords,
        totalActiveContracts: activeContracts
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get attendance chart data (attendance over time) for a college
exports.getAttendanceChartByCollege = async (req, res) => {
  try {
    const { collegeId } = req.query;
    if (!collegeId) {
      return res.status(400).json({ message: 'College ID is required' });
    }

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Get sessions for this college
    const sessions = await Session.find({ collegeId });
    const sessionIds = sessions.map(s => s._id);

    // Get attendance records for these sessions, grouped by date
    // We'll aggregate by date and sum the headCount
    const attendanceData = await Attendance.aggregate([
      { $match: { sessionId: { $in: sessionIds } } },
      { 
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalHeadCount: { $sum: '$headCount' },
          recordCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for chart: array of { date, count } where count is totalHeadCount
    const chartData = attendanceData.map(item => ({
      date: item._id,
      count: item.totalHeadCount
    }));

    res.status(200).json(chartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get distribution of trainer specialities for a college
exports.getSubjectDistributionByCollege = async (req, res) => {
  try {
    const { collegeId } = req.query;
    if (!collegeId) {
      return res.status(400).json({ message: 'College ID is required' });
    }

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Get sessions for this college
    const sessions = await Session.find({ collegeId });
    const sessionIds = sessions.map(s => s._id);

    // Get active contracts for these sessions
    const contracts = await Contract.find({ 
      sessionId: { $in: sessionIds },
      status: 'active'
    }).populate({
      path: 'trainerId',
      select: 'speciality'
    });

    // Group by speciality
    const distributionMap = new Map();
    contracts.forEach(contract => {
      const speciality = contract.trainerId.speciality || 'Unspecified';
      const count = distributionMap.get(speciality) || 0;
      distributionMap.set(speciality, count + 1);
    });

    // Convert to array of objects
    const distribution = Array.from(distributionMap.entries()).map(([speciality, count]) => ({
      subject: speciality,
      count
    }));

    res.status(200).json(distribution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
