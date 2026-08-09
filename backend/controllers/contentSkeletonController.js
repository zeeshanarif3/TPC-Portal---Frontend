const ContentSkeleton = require('../models/ContentSkeleton');
const Content = require('../models/Content');
const mongoose = require('mongoose');

// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /
exports.createSkeleton = async (req, res, next) => {
  try {
    const { title, programId, classNumber, expectedFormat, timeline, metadata, status } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (classNumber === undefined || classNumber === null || typeof classNumber !== 'number') {
      return res.status(400).json({ success: false, message: 'Class number is required and must be a number' });
    }

    if (programId && !isValidObjectId(programId)) {
      return res.status(400).json({ success: false, message: 'Invalid programId format' });
    }

    const newSkeleton = new ContentSkeleton({
      title,
      programId: programId || null,
      classNumber,
      expectedFormat: expectedFormat || 'pdf',
      timeline: timeline || { scheduledDate: null, deadline: null },
      metadata: metadata || { topic: '', description: '', tags: [], durationMinutes: 0 },
      status: status || 'draft',
      createdBy: req.user.id
    });

    await newSkeleton.save();

    return res.status(201).json({
      success: true,
      data: newSkeleton,
      message: 'ContentSkeleton created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// GET /
exports.getAllSkeletons = async (req, res, next) => {
  try {
    const { programId, classNumber, status } = req.query;
    const filter = {};

    // Validate and apply programId filter
    if (programId) {
      if (!isValidObjectId(programId)) {
        return res.status(400).json({ success: false, message: 'Invalid programId format' });
      }
      filter.programId = programId;
    }

    // Apply classNumber filter
    if (classNumber !== undefined) {
      const num = Number(classNumber);
      if (isNaN(num)) {
        return res.status(400).json({ success: false, message: 'Class number must be a number' });
      }
      filter.classNumber = num;
    }

    // Role-based status filtering
    if (req.user.role === 'student') {
      filter.status = 'published';
    } else if (status) {
      if (!['draft', 'published'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status filter value' });
      }
      filter.status = status;
    }

    const skeletons = await ContentSkeleton.find(filter).sort({ classNumber: 1 });

    return res.status(200).json({
      success: true,
      data: skeletons
    });
  } catch (error) {
    next(error);
  }
};

// GET /:id
exports.getSkeletonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const skeleton = await ContentSkeleton.findById(id);

    if (!skeleton) {
      return res.status(404).json({ success: false, message: 'ContentSkeleton not found' });
    }

    // Prevent student from seeing drafts
    if (req.user.role === 'student' && skeleton.status === 'draft') {
      return res.status(403).json({ success: false, message: 'Forbidden: Access denied to draft skeleton' });
    }

    return res.status(200).json({
      success: true,
      data: skeleton
    });
  } catch (error) {
    next(error);
  }
};

// PUT /:id
exports.updateSkeleton = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, programId, classNumber, expectedFormat, timeline, metadata, status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const skeleton = await ContentSkeleton.findById(id);
    if (!skeleton) {
      return res.status(404).json({ success: false, message: 'ContentSkeleton not found' });
    }

    // Validation if values are passed
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' });
      }
      skeleton.title = title;
    }

    if (classNumber !== undefined) {
      if (typeof classNumber !== 'number') {
        return res.status(400).json({ success: false, message: 'Class number must be a number' });
      }
      skeleton.classNumber = classNumber;
    }

    if (programId !== undefined) {
      if (programId && !isValidObjectId(programId)) {
        return res.status(400).json({ success: false, message: 'Invalid programId format' });
      }
      skeleton.programId = programId || null;
    }

    if (expectedFormat !== undefined) {
      if (!['pdf', 'video', 'doc', 'link', 'live'].includes(expectedFormat)) {
        return res.status(400).json({ success: false, message: 'Invalid expectedFormat' });
      }
      skeleton.expectedFormat = expectedFormat;
    }

    if (timeline !== undefined) {
      skeleton.timeline = {
        scheduledDate: timeline.scheduledDate !== undefined ? timeline.scheduledDate : skeleton.timeline.scheduledDate,
        deadline: timeline.deadline !== undefined ? timeline.deadline : skeleton.timeline.deadline
      };
    }

    if (metadata !== undefined) {
      skeleton.metadata = {
        topic: metadata.topic !== undefined ? metadata.topic : skeleton.metadata.topic,
        description: metadata.description !== undefined ? metadata.description : skeleton.metadata.description,
        tags: metadata.tags !== undefined ? metadata.tags : skeleton.metadata.tags,
        durationMinutes: metadata.durationMinutes !== undefined ? metadata.durationMinutes : skeleton.metadata.durationMinutes
      };
    }

    if (status !== undefined) {
      if (!['draft', 'published'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      skeleton.status = status;
    }

    await skeleton.save();

    return res.status(200).json({
      success: true,
      data: skeleton,
      message: 'ContentSkeleton updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /:id
exports.deleteSkeleton = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const skeleton = await ContentSkeleton.findById(id);
    if (!skeleton) {
      return res.status(404).json({ success: false, message: 'ContentSkeleton not found' });
    }

    // Check if Content items reference this skeleton
    const contentCount = await Content.countDocuments({ skeletonId: id });
    if (contentCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete skeleton as it is referenced by existing content items',
        data: { contentCount }
      });
    }

    await ContentSkeleton.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'ContentSkeleton deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
