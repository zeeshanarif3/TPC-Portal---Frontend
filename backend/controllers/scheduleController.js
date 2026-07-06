const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const Session = require('../models/Session');
const College = require('../models/College');
const Trainer = require('../models/Trainer');

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

// Get all schedules or schedules for a specific date
exports.getAllSchedules = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // If date query parameter is provided, filter schedules by date
    if (req.query.date) {
      const dateStr = req.query.date;
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateStr)) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      const [year, month, day] = dateStr.split('-').map(Number);
      const startOfDay = new Date(Date.UTC(year, month - 1, day));
      const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

      // Find sessions that intersect with the given date
      const sessions = await Session.find({
        startDate: { $lte: endOfDay },
        endDate: { $gte: startOfDay }
      }).select('_id');

      const sessionIds = sessions.map(s => s._id);

      let query = { sessionId: { $in: sessionIds } };

      if (userRole === 'moderator') {
        const moderatorCollege = await College.findOne({ moderatorId: userId });
        if (!moderatorCollege) {
          return res.status(404).json({ message: 'College not found for this moderator' });
        }
        const courses = await Course.find({ collegeId: moderatorCollege._id });
        const courseIds = courses.map(c => c._id);
        query = { ...query, courseId: { $in: courseIds } };
      } else if (userRole === 'trainer') {
        // For trainer, we will filter in memory after fetching by sessionId
        // Get the trainer profile for the logged-in user
        const trainer = await Trainer.findOne({ userId });
        if (!trainer) {
          return res.status(404).json({ message: 'Trainer profile not found for this user' });
        }
        // We'll filter after fetching schedules
      }
      // For admin, no additional filters beyond sessionId

      let schedules = await Schedule.find(query)
        .populate('courseId', 'courseCode')
        .populate('sessionId', 'startDate endDate');

      // If trainer, filter schedules to only those where at least one slot is assigned to this trainer
      if (userRole === 'trainer') {
        const trainerId = trainer._id;
        schedules = schedules.filter(schedule => {
          let found = false;
          for (const slot of schedule.slots.values()) {
            if (slot.trainerId.toString() === trainerId.toString()) {
              found = true;
              break;
            }
          }
          return found;
        });
      }

      res.status(200).json(schedules);
      return;
    }

    // No date filter: return all schedules based on role (admin/moderator only; trainer requires date)
    if (userRole === 'trainer') {
      return res.status(400).json({ message: 'Date query parameter is required for trainers.' });
    }

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
    } else if (userRole !== 'admin') {
      // Only admin or moderator can list all schedules without date filter
      return res.status(403).json({ message: 'Access denied. Admins and moderators only.' });
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
    if (!scheduleDeleted) {
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
