const Assessment = require('../models/Assessment');
const AssessmentSubmission = require('../models/AssessmentSubmission');
const ContentSkeleton = require('../models/ContentSkeleton');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /
exports.createAssessment = async (req, res, next) => {
  try {
    const { title, skeletonId, programId, questions, durationMinutes, scheduledDate, deadline, status } = req.body;

    // Body Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Questions are required and must be a non-empty array' });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || typeof q.questionText !== 'string' || q.questionText.trim() === '') {
        return res.status(400).json({ success: false, message: `Question ${i + 1} text is required` });
      }
      if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
        return res.status(400).json({ success: false, message: `Question ${i + 1} must have at least 2 options` });
      }
      if (q.correctOptionIndex === undefined || q.correctOptionIndex === null || typeof q.correctOptionIndex !== 'number') {
        return res.status(400).json({ success: false, message: `Question ${i + 1} correctOptionIndex is required and must be a number` });
      }
      if (q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
        return res.status(400).json({ success: false, message: `Question ${i + 1} correctOptionIndex is out of range` });
      }
    }

    if (skeletonId) {
      if (!isValidObjectId(skeletonId)) {
        return res.status(400).json({ success: false, message: 'Invalid skeletonId format' });
      }
      const skeletonExists = await ContentSkeleton.findById(skeletonId);
      if (!skeletonExists) {
        return res.status(404).json({ success: false, message: 'ContentSkeleton not found' });
      }
    }

    if (programId && !isValidObjectId(programId)) {
      return res.status(400).json({ success: false, message: 'Invalid programId format' });
    }

    const assessment = new Assessment({
      title,
      skeletonId: skeletonId || null,
      programId: programId || null,
      createdBy: req.user.id,
      questions,
      durationMinutes: durationMinutes || null,
      scheduledDate: scheduledDate || null,
      deadline: deadline || null,
      status: status || 'draft'
    });

    await assessment.save();

    return res.status(201).json({
      success: true,
      data: assessment,
      message: 'Assessment created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// // GET /
// exports.getAllAssessments = async (req, res, next) => {
//   try {
//     const userRole = req.user.role;

//     if (userRole === 'student') {
//       // Students see only published assessments
//       const assessments = await Assessment.find({ status: 'published' }).lean();
      
//       // Get student's submissions to mark attempted flag
//       const submissions = await AssessmentSubmission.find({ studentId: req.user.id }).select('assessmentId');
//       const attemptedIds = new Set(submissions.map(s => s.assessmentId.toString()));

//       // Sanitize answers (remove correctOptionIndex) and add attempted flag
//       const sanitized = assessments.map(assessment => {
//         const attempted = attemptedIds.has(assessment._id.toString());
        
//         const questions = assessment.questions.map(q => {
//           const { correctOptionIndex, ...rest } = q;
//           return rest;
//         });

//         return {
//           ...assessment,
//           attempted,
//           questions
//         };
//       });

//       return res.status(200).json({
//         success: true,
//         data: sanitized
//       });
//     } else {
//       // Trainers and admins see all assessments with submission counts
//       const assessments = await Assessment.find().lean();
//       const updated = [];
//       for (const assessment of assessments) {
//         const count = await AssessmentSubmission.countDocuments({ assessmentId: assessment._id });
//         updated.push({
//           ...assessment,
//           submissionCount: count
//         });
//       }

//       return res.status(200).json({
//         success: true,
//         data: updated
//       });
//     }
//   } catch (error) {
//     next(error);
//   }
// };
// GET /
exports.getAllAssessments = async (req, res, next) => {
  try {
    const userRole = req.user.role;

    if (userRole === 'student') {
      // Students see only published assessments
      const assessments = await Assessment.find({ status: 'published' }).lean();

      // Get student's submissions to mark attempted flag
      const submissions = await AssessmentSubmission.find({ studentId: req.user.id }).select('assessmentId');
      const attemptedIds = new Set(submissions.map(s => s.assessmentId.toString()));

      // Use the server's own clock to decide expiry — never trust a
      // client-supplied "now", since a device clock can be changed.
      const now = new Date();

      const sanitized = assessments.map(assessment => {
        const attempted = attemptedIds.has(assessment._id.toString());
        const expired = !!(assessment.deadline && now > new Date(assessment.deadline));

        // Once a student has already attempted (a submission exists — the
        // unique index guarantees at most one) or the deadline has passed,
        // there's no legitimate reason to keep handing back the full
        // question set on every list refresh. Serve a locked summary
        // instead so repeated GET calls can't be used to keep reading
        // question text/options indefinitely.
        if (attempted || expired) {
          return {
            _id: assessment._id,
            title: assessment.title,
            durationMinutes: assessment.durationMinutes,
            scheduledDate: assessment.scheduledDate,
            deadline: assessment.deadline,
            status: assessment.status,
            questionCount: assessment.questions.length,
            attempted,
            expired,
            questions: [] // locked — nothing left to attempt
          };
        }

        const questions = assessment.questions.map(q => {
          const { correctOptionIndex, ...rest } = q;
          return rest;
        });

        return {
          ...assessment,
          attempted,
          expired,
          questions
        };
      });

      return res.status(200).json({
        success: true,
        data: sanitized
      });
    } else {
      // Trainers and admins see all assessments with submission counts
      const assessments = await Assessment.find().lean();
      const updated = [];
      for (const assessment of assessments) {
        const count = await AssessmentSubmission.countDocuments({ assessmentId: assessment._id });
        updated.push({
          ...assessment,
          submissionCount: count
        });
      }

      return res.status(200).json({
        success: true,
        data: updated
      });
    }
  } catch (error) {
    next(error);
  }
};
// GET /:id
exports.getAssessmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const assessment = await Assessment.findById(id).lean();
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    if (userRole === 'student') {
      if (assessment.status !== 'published') {
        return res.status(403).json({ success: false, message: 'Forbidden: Assessment is not published' });
      }

      // Check if already attempted
      const attempted = await AssessmentSubmission.exists({ assessmentId: id, studentId: req.user.id });
      if (attempted) {
        return res.status(403).json({ success: false, message: 'Forbidden: You have already submitted this assessment' });
      }

      // Check deadline
      if (assessment.deadline && new Date() > new Date(assessment.deadline)) {
        return res.status(410).json({ success: false, message: 'Gone: The deadline for this assessment has passed' });
      }

      // Sanitize questions
      assessment.questions = assessment.questions.map(q => {
        const { correctOptionIndex, ...rest } = q;
        return rest;
      });

      return res.status(200).json({
        success: true,
        data: assessment
      });
    } else {
      // Trainers and Admins get full assessment details
      // Trainer check
      if (userRole === 'trainer' && assessment.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden: Access denied to this assessment' });
      }

      return res.status(200).json({
        success: true,
        data: assessment
      });
    }
  } catch (error) {
    next(error);
  }
};

// PUT /:id
exports.updateAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const { title, skeletonId, programId, questions, durationMinutes, scheduledDate, deadline, status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Role verification
    // if (userRole === 'trainer' && assessment.createdBy.toString() !== req.user.id) {
    //   return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own assessments' });
    // }

    // Check if there are submissions
    const submissionCount = await AssessmentSubmission.countDocuments({ assessmentId: id });
    if (submissionCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Conflict: Cannot edit assessment as submissions already exist'
      });
    }

    // Update fields
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      assessment.title = title;
    }

    if (skeletonId !== undefined) {
      if (skeletonId) {
        if (!isValidObjectId(skeletonId)) {
          return res.status(400).json({ success: false, message: 'Invalid skeletonId format' });
        }
        const skeletonExists = await ContentSkeleton.findById(skeletonId);
        if (!skeletonExists) {
          return res.status(404).json({ success: false, message: 'ContentSkeleton not found' });
        }
      }
      assessment.skeletonId = skeletonId || null;
    }

    if (programId !== undefined) {
      if (programId && !isValidObjectId(programId)) {
        return res.status(400).json({ success: false, message: 'Invalid programId format' });
      }
      assessment.programId = programId || null;
    }

    if (questions !== undefined) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ success: false, message: 'Questions must be a non-empty array' });
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText || typeof q.questionText !== 'string' || q.questionText.trim() === '') {
          return res.status(400).json({ success: false, message: `Question ${i + 1} text is required` });
        }
        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
          return res.status(400).json({ success: false, message: `Question ${i + 1} must have at least 2 options` });
        }
        if (q.correctOptionIndex === undefined || q.correctOptionIndex === null || typeof q.correctOptionIndex !== 'number') {
          return res.status(400).json({ success: false, message: `Question ${i + 1} correctOptionIndex is required and must be a number` });
        }
        if (q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
          return res.status(400).json({ success: false, message: `Question ${i + 1} correctOptionIndex is out of range` });
        }
      }
      assessment.questions = questions;
    }

    if (durationMinutes !== undefined) {
      assessment.durationMinutes = durationMinutes || null;
    }

    if (scheduledDate !== undefined) {
      assessment.scheduledDate = scheduledDate || null;
    }

    if (deadline !== undefined) {
      assessment.deadline = deadline || null;
    }

    if (status !== undefined) {
      if (!['draft', 'published', 'closed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      assessment.status = status;
    }

    await assessment.save();

    return res.status(200).json({
      success: true,
      data: assessment,
      message: 'Assessment updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /:id
exports.deleteAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Role verification
    if (userRole === 'trainer' && assessment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own assessments' });
    }

    // Cascade delete submissions
    await AssessmentSubmission.deleteMany({ assessmentId: id });

    // Delete assessment
    await Assessment.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Assessment and all associated submissions deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// --- AssessmentSubmission Controllers ---

// POST /api/assessments/:id/submit
exports.submitAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // Validation: must be published
    if (assessment.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Assessment is not open for submission' });
    }

    // Validation: deadline check
    if (assessment.deadline && new Date() > new Date(assessment.deadline)) {
      return res.status(400).json({ success: false, message: 'Assessment deadline has passed' });
    }

    // Enforce single attempt
    const existingSubmission = await AssessmentSubmission.findOne({ assessmentId: id, studentId: req.user.id });
    if (existingSubmission) {
      return res.status(409).json({ success: false, message: 'Conflict: You have already submitted this assessment' });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array is required' });
    }

    // Auto-grade
    let score = 0;
    let totalMarks = 0;

    assessment.questions.forEach((q, idx) => {
      totalMarks += (q.marks || 1);
      const studentAns = answers.find(a => a.questionIndex === idx);
      if (studentAns && studentAns.selectedOptionIndex === q.correctOptionIndex) {
        score += (q.marks || 1);
      }
    });

    const submission = new AssessmentSubmission({
      assessmentId: id,
      studentId: req.user.id,
      answers,
      score,
      totalMarks,
      submittedAt: new Date()
    });

    await submission.save();

    return res.status(201).json({
      success: true,
      data: { score, totalMarks },
      message: 'Assessment submitted and graded successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Conflict: You have already submitted this assessment' });
    }
    next(error);
  }
};

// GET /api/assessments/:id/submissions (trainers/admin only)
exports.getAssessmentSubmissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    // // Trainer access control           broooooooooo why did you add this for trainer
    // if (userRole === 'trainer' && assessment.createdBy.toString() !== req.user.id) {
    //   return res.status(403).json({ success: false, message: 'Forbidden: Access denied to this assessment\'s submissions' });
    // }

    const submissions = await AssessmentSubmission.find({ assessmentId: id })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/assessments/:id/submissions/me (student only)
exports.getOwnSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const submission = await AssessmentSubmission.findOne({ assessmentId: id, studentId: req.user.id })
      .populate('assessmentId', 'title description totalMarks');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'No submission found for this assessment' });
    }

    return res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};
