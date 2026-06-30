const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const Session = require('../models/Session');
const College = require('../models/College');

const validateCourseSessionRelationship = (course, session) => {
  if (course.collegeId.toString() !== session.collegeId.toString()) {
    return 'Course and session must belong to the same college';
  }

  const isCourseInSession = session.courseIds.some(
    courseId => courseId.toString() === course._id.toString()
  );

  if (!isCourseInSession) {
    return 'Course is not assigned to this session';
  }

  return null;
};

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

    const relationshipError = validateCourseSessionRelationship(course, session);
    if (relationshipError) {
      return res.status(400).json({ message: relationshipError });
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
    const existingSchedule = await Schedule.findById(req.params.id);
    if (!existingSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const effectiveCourseId = courseId || existingSchedule.courseId;
    const effectiveSessionId = sessionId || existingSchedule.sessionId;
    let course;
    let session;

    // If courseId is provided, verify it exists
    course = await Course.findById(effectiveCourseId);
    if (!course) {
      return res.status(400).json({ message: 'Course not found' });
    }

    // If sessionId is provided, verify it exists
    session = await Session.findById(effectiveSessionId);
    if (!session) {
      return res.status(400).json({ message: 'Session not found' });
    }

    const relationshipError = validateCourseSessionRelationship(course, session);
    if (relationshipError) {
      return res.status(400).json({ message: relationshipError });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { courseId, sessionId, slots },
      { new: true, runValidators: true }
    )
    .populate('courseId', 'courseCode')
    .populate('sessionId', 'startDate endDate');

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
// Get upcoming schedule for a college (sessions that are not ended)
exports.getUpcomingScheduleByCollege = async (req, res) => {
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

    // Get sessions that are not ended (endDate >= today) or ongoing/upcoming
    const today = new Date();
    const sessions = await Session.find({ 
      collegeId,
      endDate: { $gte: today } // sessions that have not ended yet
    });

    // Get schedules for these sessions
    const schedules = await Schedule.find({ 
      sessionId: { $in: sessions.map(s => s._id) }
    }).populate({
      path: 'courseId',
      select: 'courseCode'
    }).populate({
      path: 'sessionId',
      select: 'startDate endDate'
    });

    // Format the response
    const upcomingSchedule = schedules.map(schedule => ({
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

    res.status(200).json(upcomingSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
