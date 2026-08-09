const Slot = require('../models/Slot');
const Student = require('../models/Student');
const AssessmentSubmission = require('../models/AssessmentSubmission');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Common helper function to aggregate performance data
const aggregatePerformance = async (studentId) => {
  // Find Student profile
  const student = await Student.findOne({ userId: studentId }) || await Student.findById(studentId);
  if (!student) {
    throw new Error('Student profile not found');
  }

  // 1. Attendance stats computed directly from Slots
  const slots = await Slot.find({
    courseId: student.courseId,
    attendanceTaken: true
  });

  let present = 0;
  let absent = 0;
  const late = 0; // Slot schema only tracks presentStudents array, so late is not recorded separately

  slots.forEach(slot => {
    // if (slot.presentStudents.includes(student.rollNumber)) {
    if (slot.presentStudents.includes(student._id)) {
      present++;
    } else {
      absent++;
    }
  });

  const totalClasses = slots.length;
  const attendancePercentage = totalClasses > 0 
    ? Math.round((present / totalClasses) * 100) 
    : 0;

  const attendance = {
    totalClasses,
    present,
    absent,
    late,
    percentage: attendancePercentage
  };

  // 2. Assessment stats
  const submissions = await AssessmentSubmission.find({ studentId: student.userId })
    .populate('assessmentId', 'title');

  let totalAttempted = submissions.length;
  let sumOfPercents = 0;
  let bestScorePercent = 0;
  const submissionDetails = [];

  submissions.forEach(sub => {
    const title = sub.assessmentId ? sub.assessmentId.title : 'Deleted Assessment';
    const percent = sub.totalMarks > 0 
      ? Math.round((sub.score / sub.totalMarks) * 100) 
      : 0;

    sumOfPercents += percent;
    if (percent > bestScorePercent) {
      bestScorePercent = percent;
    }

    submissionDetails.push({
      assessmentId: sub.assessmentId ? sub.assessmentId._id : null,
      title,
      score: sub.score,
      totalMarks: sub.totalMarks,
      percentageScore: percent
    });
  });

  const averageScorePercent = totalAttempted > 0 
    ? Math.round(sumOfPercents / totalAttempted) 
    : 0;

  const assessments = {
    totalAttempted,
    averageScorePercent,
    bestScorePercent,
    submissions: submissionDetails
  };

  // 3. Feedback list (most recent first)
  const feedbackList = await Feedback.find({ studentId: student.userId })
    .populate('trainerId', 'name email')
    .populate('skeletonId', 'title classNumber')
    .sort({ date: -1 });

  const feedback = feedbackList.map(f => ({
    _id: f._id,
    rating: f.rating,
    comments: f.comments,
    date: f.date,
    trainer: f.trainerId ? { name: f.trainerId.name, email: f.trainerId.email } : null,
    class: f.skeletonId ? { title: f.skeletonId.title, classNumber: f.skeletonId.classNumber } : null
  }));

  return {
    attendance,
    assessments,
    feedback
  };
};

// GET /api/performance/me (student for themselves)
exports.getMyPerformance = async (req, res, next) => {
  try {
    const data = await aggregatePerformance(req.user.id);
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/performance/:studentId (trainer/admin for a specific student)
exports.getStudentPerformance = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }

    // Verify student user account exists
    const studentUser = await User.findById(studentId);
    if (!studentUser) {
      return res.status(404).json({ success: false, message: 'Student account not found' });
    }

    const data = await aggregatePerformance(studentId);
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
