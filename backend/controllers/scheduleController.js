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
    const userId = req.user.id;
    const userRole = req.user.role;

    // If moderator, verify they are associated with the college
    let moderatorCollege = null;
    if (userRole === 'moderator') {
      moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
    }

    // Verify that the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: 'Course not found' });
    }

    // If moderator, verify the course belongs to their college
    if (userRole === 'moderator') {
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only create schedules for courses in their own college' });
      }
    }

    // Verify that the session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(400).json({ message: 'Session not found' });
    }

    // If moderator, verify the session belongs to their college (via course college or session college)
    if (userRole === 'moderator') {
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      // Check that the session's college matches the moderator's college
      if (session.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only create schedules for sessions in their own college' });
      }
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
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = {};
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      // Get courses for this college, then schedules for those courses
      const courses = await Course.find({ collegeId: moderatorCollege._id });
      const courseIds = courses.map(c => c._id);
      filter = { courseId: { $in: courseIds } };
    }

    const schedules = await Schedule.find(filter)
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

    // If moderator, verify the schedule's course belongs to their college
    const userRole = req.user.role;
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: req.user.id });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      // Populate might not have populated the course's collegeId, so we need to fetch the course
      const course = await Course.findById(schedule.courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only access schedules for courses in their own college' });
      }
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
    const userId = req.user.id;
    const userRole = req.user.role;

    // If moderator, get their college
    let moderatorCollege = null;
    if (userRole === 'moderator') {
      moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
    }

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
    // If moderator, verify the course belongs to their college
    if (userRole === 'moderator') {
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only update schedules for courses in their own college' });
      }
    }

    // If sessionId is provided, verify it exists
    session = await Session.findById(effectiveSessionId);
    if (!session) {
      return res.status(400).json({ message: 'Session not found' });
    }
    // If moderator, verify the session belongs to their college
    if (userRole === 'moderator') {
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (session.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only update schedules for sessions in their own college' });
      }
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
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the schedule first to check course
    const schedule = await Schedule.findById(req.params.id).populate('courseId');
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // If moderator, verify the schedule's course belongs to their college
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      // Populate might not have populated the course's collegeId, so we need to fetch the course
      const course = await Course.findById(schedule.courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only delete schedules for courses in their own college' });
      }
    }

    const scheduleDeleted = await Schedule.findByIdAndDelete(req.params.id);
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

    // If moderator, verify they are associated with the college
    const userRole = req.user.role;
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: req.user.id });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (collegeId !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only access schedules for their own college' });
      }
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
        _id: session.sessionId._id,
        startDate: session.sessionId.startDate,
        endDate: session.sessionId.endDate
      },
      slots: schedule.slots
    }));

    res.status(200).json(upcomingSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
