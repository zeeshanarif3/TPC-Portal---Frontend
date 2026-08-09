const Feedback = require('../models/Feedback');
const User = require('../models/User');
const ContentSkeleton = require('../models/ContentSkeleton');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /
exports.createFeedback = async (req, res, next) => {
  try {
    const { studentId, skeletonId, rating, comments } = req.body;

    if (!studentId || !isValidObjectId(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing studentId' });
    }

    // Verify student exists and has student role
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
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

    if (rating === undefined || rating === null || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating is required and must be a number between 1 and 5' });
    }

    const feedback = new Feedback({
      studentId,
      trainerId: req.user.id,
      skeletonId: skeletonId || null,
      rating,
      comments: comments || '',
      date: new Date()
    });

    await feedback.save();

    return res.status(201).json({
      success: true,
      data: feedback,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// GET /
exports.getFeedback = async (req, res, next) => {
  try {
    const { studentId } = req.query;
    const filter = {};

    if (studentId) {
      if (!isValidObjectId(studentId)) {
        return res.status(400).json({ success: false, message: 'Invalid studentId format' });
      }
      filter.studentId = studentId;
    }

    const feedbacks = await Feedback.find(filter)
      .populate('studentId', 'name email')
      .populate('trainerId', 'name email')
      .populate('skeletonId', 'title classNumber')
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};

// GET /me
exports.getMyFeedback = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find({ studentId: req.user.id })
      .populate('trainerId', 'name email')
      .populate('skeletonId', 'title classNumber')
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};

// PUT /:id
exports.updateFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comments, skeletonId } = req.body;
    const userRole = req.user.role;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    // // Authorization: trainer who created it, or admin
    // if (userRole === 'trainer' && feedback.trainerId.toString() !== req.user.id) {
    //   return res.status(403).json({ success: false, message: 'Forbidden: You can only edit your own feedback' });
    // }

    // Validation & Updates
    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
      }
      feedback.rating = rating;
    }

    if (comments !== undefined) {
      feedback.comments = comments;
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
      feedback.skeletonId = skeletonId || null;
    }

    feedback.date = new Date();
    await feedback.save();

    return res.status(200).json({
      success: true,
      data: feedback,
      message: 'Feedback updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /:id
exports.deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    // // Authorization: trainer who created it, or admin
    // if (userRole === 'trainer' && feedback.trainerId.toString() !== req.user.id) {
    //   return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own feedback' });
    // }

    await Feedback.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
