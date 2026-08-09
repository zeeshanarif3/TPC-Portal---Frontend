const Slot = require('../models/Slot');
const Course = require('../models/Course');
const Session = require('../models/Session');
const College = require('../models/College');
const Trainer = require('../models/Trainer');
const Contract = require('../models/Contract');
const Student = require('../models/Student');

// Helper to validate relationship between Course and Session
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

// Helper to get trainer by user ID
const getLoggedInTrainer = async (userId) => {
  return Trainer.findOne({ userId });
};

// Helper to check if trainer has active contract for session
const trainerHasActiveSessionContract = async (trainerId, sessionId) => {
  return Contract.exists({
    trainerId,
    sessionId,
    status: 'active'
  });
};

// ==========================================
// SCHEDULE / SLOT OPERATIONS
// ==========================================

// Create a new slot
exports.createSlot = async (req, res) => {
  try {
    const { courseId, sessionId, date, startTime, endTime, trainerId, roomNo, topic } = req.body;
    if (!courseId || !sessionId || !date || !startTime || !endTime || !trainerId || !roomNo) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (
      typeof courseId !== 'string' ||
      typeof sessionId !== 'string' ||
      typeof date !== 'string' ||
      typeof startTime !== 'string' ||
      typeof endTime !== 'string' ||
      typeof trainerId !== 'string' ||
      typeof roomNo !== 'string' ||
      (topic !== undefined && typeof topic !== 'string')
    ) {
      return res.status(400).json({ message: 'Invalid field types' });
    }

    let moderatorCollege = null;
    if (req.user.role === 'moderator') {
      moderatorCollege = await College.findOne({ moderatorId: req.user.id });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
    }

    const course = await Course.findById(courseId);
    const session = await Session.findById(sessionId);
    if (!course || !session) {
      return res.status(400).json({ message: 'Course or Session not found' });
    }

    if (req.user.role === 'moderator') {
      if (course.collegeId.toString() !== moderatorCollege._id.toString() ||
        session.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Access denied: Course and Session must belong to your college' });
      }
    }

    const relationshipError = validateCourseSessionRelationship(course, session);
    if (relationshipError) {
      return res.status(400).json({ message: relationshipError });
    }

    const slot = new Slot({
      courseId,
      sessionId,
      date,
      startTime,
      endTime,
      trainerId,
      roomNo,
      topic,
      status: 'scheduled'
    });
    await slot.save();

    const populatedSlot = await Slot.findById(slot._id)
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate');

    res.status(201).json(populatedSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all slots (List / Filter)
exports.getAllSlots = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = {};

    // Dynamic filters based on query parameters
    const queryKeys = ['courseId', 'sessionId', 'trainerId', 'roomNo', 'topic', 'status'];
    for (const key of queryKeys) {
      if (req.query[key]) {
        filter[key] = req.query[key];
      }
    }

    if (req.query.date) {
      const dateStr = req.query.date;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateStr)) {
        return res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      filter.date = dateStr;
    }

    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      const courses = await Course.find({ collegeId: moderatorCollege._id });
      const courseIds = courses.map(c => c._id);

      if (filter.courseId) {
        if (!courseIds.some(id => id.toString() === filter.courseId.toString())) {
          filter.courseId = { $in: [] };
        }
      } else {
        filter.courseId = { $in: courseIds };
      }
    } else if (userRole === 'trainer') {
      if (!req.query.date) {
        return res.status(400).json({ message: 'Date query parameter is required for trainers.' });
      }
      const trainer = await Trainer.findOne({ userId });
      if (!trainer) {
        return res.status(404).json({ message: 'Trainer profile not found for this user' });
      }
      filter.trainerId = trainer._id;
    } else if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const slots = await Slot.find(filter)
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate');

    // console.log(slots)

    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get slot by ID
exports.getSlotById = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id)
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate');
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (req.user.role === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: req.user.id });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }

      const course = await Course.findById(slot.courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only access slots for courses in their own college' });
      }
    }

    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update slot by ID
exports.updateSlot = async (req, res) => {
  try {
    const existingSlot = await Slot.findById(req.params.id);
    if (!existingSlot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    const effectiveCourseId = req.body.courseId || existingSlot.courseId;
    const effectiveSessionId = req.body.sessionId || existingSlot.sessionId;

    let moderatorCollege = null;
    if (req.user.role === 'moderator') {
      moderatorCollege = await College.findOne({ moderatorId: req.user.id });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
    }

    const course = await Course.findById(effectiveCourseId);
    const session = await Session.findById(effectiveSessionId);
    if (!course || !session) {
      return res.status(400).json({ message: 'Course or Session not found' });
    }

    if (req.user.role === 'moderator') {
      if (course.collegeId.toString() !== moderatorCollege._id.toString() ||
        session.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Access denied: Course and Session must belong to your college' });
      }
    }

    const relationshipError = validateCourseSessionRelationship(course, session);
    if (relationshipError) {
      return res.status(400).json({ message: relationshipError });
    }

    const properties = ['courseId', 'sessionId', 'date', 'startTime', 'endTime', 'trainerId', 'roomNo', 'status', 'topic'];
    properties.forEach(prop => {
      if (req.body[prop] !== undefined) {
        existingSlot[prop] = req.body[prop];
      }
    });

    await existingSlot.save();
    await existingSlot.populate([
      { path: 'courseId', select: 'courseCode' },
      { path: 'sessionId', select: 'startDate endDate' }
    ]);

    res.status(200).json(existingSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete slot by ID
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (req.user.role === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: req.user.id });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      const course = await Course.findById(slot.courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only delete slots for courses in their own college' });
      }
    }

    await Slot.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upcoming slots for a college
exports.getUpcomingSlotsByCollege = async (req, res) => {
  try {
    const { collegeId } = req.query;
    if (!collegeId) {
      return res.status(400).json({ message: 'College ID is required' });
    }

    if (req.user.role === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: req.user.id });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (collegeId !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only access slots for their own college' });
      }
    }

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    const sessions = await Session.find({
      collegeId,
      endDate: { $gte: new Date() }
    });

    const sessionIds = sessions.map(s => s._id);

    const today = new Date();
    // today.setHours(0, 0, 0, 0);

    const slots = await Slot.find({
      sessionId: { $in: sessionIds },
      date: { $gte: today }
    })
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate');

    const upcomingSchedule = slots.map(slot => ({
      _id: slot._id,
      course: slot.courseId ? {
        _id: slot.courseId._id,
        courseCode: slot.courseId.courseCode
      } : null,
      session: slot.sessionId ? {
        _id: slot.sessionId._id,
        startDate: slot.sessionId.startDate,
        endDate: slot.sessionId.endDate
      } : null,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      trainerId: slot.trainerId,
      roomNo: slot.roomNo,
      topic: slot.topic,
      status: slot.status,
      attendanceTaken: slot.attendanceTaken,
      presentStudents: slot.presentStudents,
      headCount: slot.headCount,
      feedback: slot.feedback
    }));

    res.status(200).json(upcomingSchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Append slots via CSV rows
exports.appendSlotsViaCSV = async (req, res) => {
  try {
    const rows = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'Request body must be a non-empty array of parsed CSV rows' });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    let moderatorCollege = null;
    if (userRole === 'moderator') {
      moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
    }

    const courseCache = {};
    const sessionCache = {};
    const newSlots = [];

    for (const row of rows) {
      const { courseId, sessionId, startTime, endTime, roomNo, trainerId, topic } = row;
      if (!courseId || !sessionId || !startTime || !endTime || !trainerId || !roomNo) {
        return res.status(400).json({ message: 'Missing required fields: courseId, sessionId, startTime, endTime, trainerId, roomNo' });
      }

      if (userRole === 'moderator') {
        let course = courseCache[courseId];
        if (!course) {
          course = await Course.findById(courseId);
          if (course) courseCache[courseId] = course;
        }
        if (!course || course.collegeId.toString() !== moderatorCollege._id.toString()) {
          return res.status(403).json({ message: 'Moderators can only access courses in their own college' });
        }

        let session = sessionCache[sessionId];
        if (!session) {
          session = await Session.findById(sessionId);
          if (session) sessionCache[sessionId] = session;
        }
        if (!session || session.collegeId.toString() !== moderatorCollege._id.toString()) {
          return res.status(403).json({ message: 'Moderators can only access sessions in their own college' });
        }
      }

      let dateKey = 'default';
      let startTimeVal = startTime;
      let endTimeVal = endTime;

      if (typeof startTime === 'string') {
        if (startTime.includes('T')) {
          const parts = startTime.split('T');
          dateKey = parts[0];
          startTimeVal = parts[1] ? parts[1].substring(0, 5) : startTime;
        } else if (startTime.includes(' ')) {
          const parts = startTime.split(' ');
          dateKey = parts[0];
          startTimeVal = parts[1] ? parts[1].substring(0, 5) : startTime;
        } else if (startTime.includes('-')) {
          dateKey = startTime.substring(0, 10);
        }
      }

      if (typeof endTime === 'string') {
        if (endTime.includes('T')) {
          const parts = endTime.split('T');
          endTimeVal = parts[1] ? parts[1].substring(0, 5) : endTime;
        } else if (endTime.includes(' ')) {
          const parts = endTime.split(' ');
          endTimeVal = parts[1] ? parts[1].substring(0, 5) : endTime;
        }
      }

      if (row.date) {
        dateKey = row.date.toString();
      } else if (row.day) {
        dateKey = row.day.toString();
      }

      const slotData = {
        courseId,
        sessionId,
        date: dateKey,
        startTime: startTimeVal,
        endTime: endTimeVal,
        trainerId,
        roomNo,
        status: 'scheduled'
      };
      if (topic) {
        slotData.topic = topic;
      }

      newSlots.push(new Slot(slotData));
    }

    const savedSlots = await Slot.insertMany(newSlots);

    const populatedSlots = await Slot.find({
      _id: { $in: savedSlots.map(s => s._id) }
    })
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate');

    res.status(200).json(populatedSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update topic and feedback of a slot by ID
exports.updateTopicAndFeedback = async (req, res) => {
  try {
    const { topic, feedback } = req.body;

    if (topic !== undefined && typeof topic !== 'string') {
      return res.status(400).json({ message: 'Topic must be a string' });
    }
    if (feedback !== undefined && typeof feedback !== 'string') {
      return res.status(400).json({ message: 'Feedback must be a string' });
    }

    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // Role-based authorization
    if (req.user.role === 'trainer') {
      const trainer = await Trainer.findOne({ userId: req.user.id });
      if (!trainer) {
        return res.status(404).json({ message: 'Trainer profile not found for this user' });
      }
      if (slot.trainerId.toString() !== trainer._id.toString()) {
        return res.status(403).json({ message: 'Access denied: You can only edit topic and feedback for your own slots' });
      }
    } else if (req.user.role === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: req.user.id });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      const course = await Course.findById(slot.courseId);
      if (!course || course.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Access denied: Course must belong to your college' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (topic !== undefined) {
      slot.topic = topic;
    }
    if (feedback !== undefined) {
      slot.feedback = feedback;
    }

    await slot.save();
    await slot.populate([
      { path: 'courseId', select: 'courseCode' },
      { path: 'sessionId', select: 'startDate endDate' }
    ]);

    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// ATTENDANCE OPERATIONS
// ==========================================

// Get upcoming classes for a trainer (based on active contracts)
exports.getUpcomingClasses = async (req, res) => {
  try {
    const trainer = await getLoggedInTrainer(req.user.id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer profile not found for this user' });
    }

    // Find active contracts for the trainer
    const activeContracts = await Contract.find({
      trainerId: trainer._id,
      status: 'active'
    }).populate('sessionId');

    if (!activeContracts || activeContracts.length === 0) {
      return res.status(200).json([]);
    }

    // Get session IDs from active contracts
    const sessionIds = activeContracts.map(contract => contract.sessionId._id);

    // Find slots for these sessions where this trainer is assigned
    const today = new Date();
    // today.setHours(0, 0, 0, 0);

    const slots = await Slot.find({
      sessionId: { $in: sessionIds },
      trainerId: trainer._id,
      date: { $gte: today }
    })
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate');

    // Format for response payload compatibility
    const upcomingClasses = slots.map(slot => ({
      _id: slot._id,
      course: slot.courseId ? {
        _id: slot.courseId._id,
        courseCode: slot.courseId.courseCode
      } : null,
      session: slot.sessionId ? {
        _id: slot.sessionId._id,
        startDate: slot.sessionId.startDate,
        endDate: slot.sessionId.endDate
      } : null,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      trainerId: slot.trainerId,
      roomNo: slot.roomNo,
      topic: slot.topic,
      status: slot.status,
      attendanceTaken: slot.attendanceTaken,
      presentStudents: slot.presentStudents,
      headCount: slot.headCount,
      feedback: slot.feedback
    }));

    res.status(200).json(upcomingClasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit attendance for a slot by ID (handles initial submission and updates)
exports.submitAttendance = async (req, res) => {
  try {
    const { presentStudents, feedback } = req.body;
    const presentStudentList = Array.isArray(presentStudents) ? presentStudents : [];

    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // Verify that the course exists
    const course = await Course.findById(slot.courseId);
    if (!course) {
      return res.status(400).json({ message: 'Course not found' });
    }

    // Verify that the session exists
    const session = await Session.findById(slot.sessionId);
    if (!session) {
      return res.status(400).json({ message: 'Session not found' });
    }

    const relationshipError = validateCourseSessionRelationship(course, session);
    if (relationshipError) {
      return res.status(400).json({ message: relationshipError });
    }

    const trainer = await getLoggedInTrainer(req.user.id);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer profile not found for this user' });
    }

    const hasActiveContract = await trainerHasActiveSessionContract(trainer._id, slot.sessionId);
    if (!hasActiveContract) {
      return res.status(403).json({ message: 'Trainer does not have an active contract for this session' });
    }

    // Verify that this slot is assigned to the logged-in trainer
    if (slot.trainerId.toString() !== trainer._id.toString()) {
      return res.status(403).json({ message: 'This slot is not assigned to you' });
    }

    // Update the slot with attendance details
    slot.presentStudents = presentStudentList;
    slot.headCount = presentStudentList.length;
    slot.attendanceTaken = true;
    slot.status = 'completed';
    if (feedback !== undefined) {
      slot.feedback = feedback;
    }

    await slot.save();

    await slot.populate([
      { path: 'courseId', select: 'courseCode' },
      { path: 'sessionId', select: 'startDate endDate' },
      { path: 'trainerId', select: 'name' }
    ]);

    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance record by slot ID (replaces getAttendanceById)
exports.getAttendanceById = async (req, res) => {
  try {
    const slot = await Slot.findById(req.params.id)
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate')
      .populate('trainerId', 'name');

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    if (!slot.attendanceTaken) {
      return res.status(404).json({ message: 'Attendance record not found for this slot' });
    }

    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance records for a specific session and date
exports.getAttendanceBySessionAndDate = async (req, res) => {
  try {
    const { sessionId, date } = req.query;

    if (!sessionId || !date) {
      return res.status(400).json({ message: 'Session ID and date are required' });
    }

    const slot = await Slot.findOne({ sessionId, date, attendanceTaken: true })
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate')
      .populate('trainerId', 'name');

    if (!slot) {
      return res.status(404).json({ message: 'Attendance record not found for the given session and date' });
    }
    res.status(200).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get analytics/overview for a moderator's college
exports.getAnalytics = async (req, res) => {
  try {
    const moderatorId = req.user.id;

    // Find the college where this user is the moderator
    const college = await College.findOne({ moderatorId });
    if (!college) {
      return res.status(404).json({ message: 'College not found for this moderator' });
    }

    // Get all sessions for this college
    const sessions = await Session.find({ collegeId: college._id });

    // Get all courses for this college
    const courses = await Course.find({ collegeId: college._id });

    // Total students: sum of students in each course of this college
    let totalStudents = 0;
    for (const course of courses) {
      const studentCount = await Student.countDocuments({ courseId: course._id });
      totalStudents += studentCount;
    }

    // Total attendance records (slots where attendance has been taken) for sessions in this college
    const sessionIds = sessions.map(s => s._id);
    const totalAttendanceRecords = await Slot.countDocuments({
      sessionId: { $in: sessionIds },
      attendanceTaken: true
    });

    // Number of active contracts in this college's sessions
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

    // Get slot records where attendance has been taken, grouped by date
    const attendanceData = await Slot.aggregate([
      { $match: { sessionId: { $in: sessionIds }, attendanceTaken: true } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalHeadCount: { $sum: '$headCount' },
          recordCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for chart: array of { date, count }
    const chartData = attendanceData.map(item => ({
      date: item._id,
      count: item.totalHeadCount
    }));

    res.status(200).json(chartData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get distribution of trainer specialities for a college (uses Contract, not Slot)
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

// // Get attendance records for a college in a specific session
// exports.getAttendanceByCollegeAndSession = async (req, res) => {
//   try {
//     const { collegeId, sessionId } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     if (!collegeId || !sessionId) {
//       return res.status(400).json({ message: 'College ID and Session ID are required' });
//     }

//     // Verify college exists
//     const college = await College.findById(collegeId);
//     if (!college) {
//       return res.status(404).json({ message: 'College not found' });
//     }

//     if (userRole === 'moderator') {
//       const moderatorCollege = await College.findOne({ moderatorId: userId });
//       if (!moderatorCollege) {
//         return res.status(403).json({ message: 'You are not authorized to access any college' });
//       }
//       if (moderatorCollege._id.toString() !== collegeId) {
//         return res.status(403).json({ message: 'You are not authorized to access this college' });
//       }
//     }

//     // Verify session exists and belongs to the college
//     const session = await Session.findById(sessionId);
//     if (!session) {
//       return res.status(404).json({ message: 'Session not found' });
//     }
//     if (session.collegeId.toString() !== collegeId) {
//       return res.status(400).json({ message: 'Session does not belong to the specified college' });
//     }

//     // Fetch all slots where attendance was taken for this session
//     const attendanceRecords = await Slot.find({ sessionId, attendanceTaken: true })
//       .populate('courseId', 'courseCode')
//       .populate('sessionId', 'startDate endDate')
//       .populate('trainerId', 'name');

//     res.status(200).json(attendanceRecords);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// exports.getModeratorAttendanceBySession = async (req, res) => {
//     try {
//         const { sessionId } = req.params;

//         const userId = req.user.id;
//         const userRole = req.user.role;

//         if (userRole !== "moderator") {
//             return res.status(403).json({
//                 message: "Only moderators can access this route",
//             });
//         }

//         if (!sessionId) {
//             return res.status(400).json({
//                 message: "Session ID is required",
//             });
//         }

//         /*
//          * ============================================================
//          * FIND MODERATOR'S COLLEGE
//          * ============================================================
//          */
//         const college = await College.findOne({
//             moderatorId: userId,
//         });

//         if (!college) {
//             return res.status(403).json({
//                 message: "You are not assigned to any college",
//             });
//         }

//         /*
//          * ============================================================
//          * FIND SESSION
//          * ============================================================
//          */
//         const session = await Session.findById(sessionId);

//         if (!session) {
//             return res.status(404).json({
//                 message: "Session not found",
//             });
//         }

//         /*
//          * ============================================================
//          * MAKE SURE SESSION BELONGS TO MODERATOR'S COLLEGE
//          * ============================================================
//          */
//         if (
//             !session.collegeId ||
//             session.collegeId.toString() !== college._id.toString()
//         ) {
//             return res.status(403).json({
//                 message: "This session does not belong to your college",
//             });
//         }

//         /*
//          * ============================================================
//          * FETCH ATTENDANCE
//          * ============================================================
//          */
//         const attendanceRecords = await Slot.find({
//             sessionId: session._id,
//             attendanceTaken: true,
//         })
//             .populate("courseId", "courseCode")
//             .populate("sessionId", "startDate endDate")
//             .populate("trainerId", "name");

//         return res.status(200).json({
//             college: {
//                 _id: college._id,
//                 name: college.name,
//             },

//             session: {
//                 _id: session._id,
//                 startDate: session.startDate,
//                 endDate: session.endDate,
//             },

//             attendance: attendanceRecords,
//         });

//     } catch (error) {
//         console.error(
//             "getModeratorAttendanceBySession:",
//             error
//         );

//         return res.status(500).json({
//             message: error.message,
//         });
//     }
// };


// Get attendance records for a college in a specific session
exports.getAttendanceByCollegeAndSession = async (req, res) => {
  try {
    const { collegeId, sessionId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!collegeId || !sessionId) {
      return res.status(400).json({ message: 'College ID and Session ID are required' });
    }

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(403).json({ message: 'You are not authorized to access any college' });
      }
      if (moderatorCollege._id.toString() !== collegeId) {
        return res.status(403).json({ message: 'You are not authorized to access this college' });
      }
    }

    // Verify session exists and belongs to the college
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    if (session.collegeId.toString() !== collegeId) {
      return res.status(400).json({ message: 'Session does not belong to the specified college' });
    }

    // Fetch all slots where attendance was taken for this session
    const attendanceRecords = await Slot.find({ sessionId, attendanceTaken: true })
      .populate('courseId', 'courseCode')
      .populate('sessionId', 'startDate endDate')
      .populate('trainerId', 'name speciality');

    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getModeratorAttendanceBySession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const userId = req.user.id;
        const userRole = req.user.role;

        if (userRole !== "moderator") {
            return res.status(403).json({
                message: "Only moderators can access this route",
            });
        }

        if (!sessionId) {
            return res.status(400).json({
                message: "Session ID is required",
            });
        }

        /*
         * ============================================================
         * FIND MODERATOR'S COLLEGE
         * ============================================================
         */
        const college = await College.findOne({
            moderatorId: userId,
        });

        if (!college) {
            return res.status(403).json({
                message: "You are not assigned to any college",
            });
        }

        /*
         * ============================================================
         * FIND SESSION
         * ============================================================
         */
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                message: "Session not found",
            });
        }

        /*
         * ============================================================
         * MAKE SURE SESSION BELONGS TO MODERATOR'S COLLEGE
         * ============================================================
         */
        if (
            !session.collegeId ||
            session.collegeId.toString() !== college._id.toString()
        ) {
            return res.status(403).json({
                message: "This session does not belong to your college",
            });
        }

        /*
         * ============================================================
         * FETCH ATTENDANCE
         * ============================================================
         */
        const attendanceRecords = await Slot.find({
            sessionId: session._id,
            attendanceTaken: true,
        })
            .populate("courseId", "courseCode")
            .populate("sessionId", "startDate endDate")
            .populate("trainerId", "name speciality");

        return res.status(200).json({
            college: {
                _id: college._id,
                name: college.name,
            },

            session: {
                _id: session._id,
                startDate: session.startDate,
                endDate: session.endDate,
            },

            attendance: attendanceRecords,
        });

    } catch (error) {
        console.error(
            "getModeratorAttendanceBySession:",
            error
        );

        return res.status(500).json({
            message: error.message,
        });
    }
};