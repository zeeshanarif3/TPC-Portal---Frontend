const Session = require('../models/Session');
const College = require('../models/College');
const Course = require('../models/Course');

const validateCoursesBelongToCollege = (courses, collegeId) => {
  return courses.every(course => course.collegeId.toString() === collegeId.toString());
};

// Create a new session
exports.createSession = async (req, res) => {
  try {
    const { collegeId, courseIds, startDate, endDate } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // If moderator, verify they are associated with the college
    let moderatorCollege = null;
    if (userRole === 'moderator') {
      moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      // Ensure the collegeId in the request matches the moderator's college
      if (collegeId !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only create sessions for their own college' });
      }
    }

    // Verify that the college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(400).json({ message: 'College not found' });
    }

    // Verify that all courses exist
    if (courseIds && courseIds.length > 0) {
      const courses = await Course.find({ _id: { $in: courseIds } });
      if (courses.length !== courseIds.length) {
        return res.status(400).json({ message: 'One or more courses not found' });
      }
      if (!validateCoursesBelongToCollege(courses, collegeId)) {
        return res.status(400).json({ message: 'All courses must belong to the selected college' });
      }
    }

    const session = new Session({ collegeId, courseIds, startDate, endDate });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all sessions
exports.getAllSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = {};
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      filter = { collegeId: moderatorCollege._id };
    }

    const sessions = await Session.find(filter)
      .populate('collegeId', 'name')
      .populate('courseIds', 'courseCode');
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get session by ID
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('collegeId', 'name')
      .populate('courseIds', 'courseCode');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // If moderator, verify the session belongs to their college
    const userRole = req.user.role;
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: req.user.id });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (session.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only access sessions from their own college' });
      }
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update session by ID
exports.updateSession = async (req, res) => {
  try {
    const { collegeId, courseIds, startDate, endDate } = req.body;
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

    const existingSession = await Session.findById(req.params.id);
    if (!existingSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const effectiveCollegeId = collegeId || existingSession.collegeId;
    const effectiveCourseIds = courseIds || existingSession.courseIds;

    // If collegeId is provided, verify it exists
    if (collegeId) {
      const college = await College.findById(collegeId);
      if (!college) {
        return res.status(400).json({ message: 'College not found' });
      }
      // If moderator, verify the college is theirs
      if (userRole === 'moderator') {
        if (!moderatorCollege) {
          return res.status(404).json({ message: 'College not found for this moderator' });
        }
        if (collegeId !== moderatorCollege._id.toString()) {
          return res.status(403).json({ message: 'Moderators can only update sessions for their own college' });
        }
      }
    }

    // Verify all effective courses still belong to the effective college
    if (effectiveCourseIds && effectiveCourseIds.length > 0) {
      const courses = await Course.find({ _id: { $in: effectiveCourseIds } });
      if (courses.length !== effectiveCourseIds.length) {
        return res.status(400).json({ message: 'One or more courses not found' });
      }
      if (!validateCoursesBelongToCollege(courses, effectiveCollegeId)) {
        return res.status(400).json({ message: 'All courses must belong to the selected college' });
      }
      // If moderator, verify the courses belong to their college
      if (userRole === 'moderator') {
        if (!moderatorCollege) {
          return res.status(404).json({ message: 'College not found for this moderator' });
        }
        // Check that all courses are in the moderator's college
        for (const course of courses) {
          if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
            return res.status(400).json({ message: 'All courses must belong to the moderator\'s college' });
          }
        }
      }
    }

    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { collegeId, courseIds, startDate, endDate },
      { new: true, runValidators: true }
    )
    .populate('collegeId', 'name')
    .populate('courseIds', 'courseCode');

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete session by ID
exports.deleteSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the session first to check college
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // If moderator, verify the session belongs to their college
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (session.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only delete sessions from their own college' });
      }
    }

    const sessionDeleted = await Session.findByIdAndDelete(req.params.id);
    if (!sessionDeleted) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
