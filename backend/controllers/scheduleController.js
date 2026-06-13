const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const Session = require('../models/Session');

// Create a new schedule
exports.createSchedule = async (req, res) => {
  try {
    const { courseId, sessionId, slots } = req.body;

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

    const schedule = new Schedule({ courseId, sessionId, slots });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate');
    res.status(200).json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate');
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update schedule by ID
exports.updateSchedule = async (req, res) => {
  try {
    const { courseId, sessionId, slots } = req.body;

    // If courseId is provided, verify it exists
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(400).json({ message: 'Course not found' });
      }
    }

    // If sessionId is provided, verify it exists
    if (sessionId) {
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(400).json({ message: 'Session not found' });
      }
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { courseId, sessionId, slots },
      { new: true, runValidators: true }
    )
    .populate('courseId', 'courseCode')
    .populate('sessionId', 'startDate endDate');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete schedule by ID
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
