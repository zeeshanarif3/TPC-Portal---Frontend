const Content = require('../models/Content');
const ContentSkeleton = require('../models/ContentSkeleton');
const storageService = require('../services/storage.service');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /
exports.createContent = async (req, res, next) => {
  try {
    const { skeletonId, title } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    if (!skeletonId || !isValidObjectId(skeletonId)) {
      await storageService.deleteFile(req.file.path);
      return res.status(400).json({ success: false, message: 'Invalid or missing skeletonId' });
    }

    // Validate ContentSkeleton exists
    const skeleton = await ContentSkeleton.findById(skeletonId);
    if (!skeleton) {
      await storageService.deleteFile(req.file.path);
      return res.status(404).json({ success: false, message: 'ContentSkeleton not found' });
    }

    // Find the latest version of content for this skeleton
    const latestContent = await Content.findOne({ skeletonId }).sort({ version: -1 });
    const version = latestContent ? latestContent.version + 1 : 1;

    // Archive previous versions if we are uploading a new version
    if (latestContent) {
      await Content.updateMany({ skeletonId, status: 'active' }, { status: 'archived' });
    }

    // Process file path using storage service
    const savedPath = await storageService.saveFile(req.file);

    const newContent = new Content({
      skeletonId,
      classNumber: skeleton.classNumber,
      title: title || skeleton.title,
      fileName: req.file.originalname,
      filePath: savedPath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.id,
      version,
      status: 'active'
    });

    await newContent.save();

    return res.status(201).json({
      success: true,
      data: newContent,
      message: 'Content uploaded and saved successfully'
    });
  } catch (error) {
    // Clean up uploaded file if an error occurred during saving
    if (req.file) {
      await storageService.deleteFile(req.file.path);
    }
    next(error);
  }
};

// GET /
exports.getAllContent = async (req, res, next) => {
  try {
    const { skeletonId, classNumber, programId } = req.query;
    const filter = {};

    if (skeletonId) {
      if (!isValidObjectId(skeletonId)) {
        return res.status(400).json({ success: false, message: 'Invalid skeletonId format' });
      }
      filter.skeletonId = skeletonId;
    }

    if (classNumber !== undefined) {
      const num = Number(classNumber);
      if (isNaN(num)) {
        return res.status(400).json({ success: false, message: 'Class number must be a number' });
      }
      filter.classNumber = num;
    }

    if (programId) {
      if (!isValidObjectId(programId)) {
        return res.status(400).json({ success: false, message: 'Invalid programId format' });
      }
      // Find skeletons with this programId
      const skeletons = await ContentSkeleton.find({ programId }).select('_id');
      const skeletonIds = skeletons.map(s => s._id);
      filter.skeletonId = { $in: skeletonIds };
    }

    // Students only see active contents by default
    // if (req.user.role === 'student') {
    //   filter.status = 'active';
    // }

    const contents = await Content.find(filter).populate('uploadedBy', 'name email');

    return res.status(200).json({
      success: true,
      data: contents
    });
  } catch (error) {
    next(error);
  }
};

// GET /:id
exports.getContentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const content = await Content.findById(id).populate('uploadedBy', 'name email');

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    return res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    next(error);
  }
};

// GET /:id/download
exports.downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    const absolutePath = path.isAbsolute(content.filePath)
      ? content.filePath
      : path.join(__dirname, '..', content.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: 'Physical file not found on server' });
    }

    res.setHeader('Content-Type', content.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(content.fileName)}"`);

    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};


// GET /:id/preview
exports.previewFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    const absolutePath = path.isAbsolute(content.filePath)
      ? content.filePath
      : path.join(__dirname, "..", content.filePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: "Physical file not found",
      });
    }

    res.setHeader(
      "Content-Type",
      content.mimeType || "application/octet-stream"
    );

    // <-- THIS is the important part
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(content.fileName)}"`
    );

    fs.createReadStream(absolutePath).pipe(res);
  } catch (err) {
    next(err);
  }
};















// PUT /:id
exports.updateContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!isValidObjectId(id)) {
      if (req.file) await storageService.deleteFile(req.file.path);
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const content = await Content.findById(id);
    if (!content) {
      if (req.file) await storageService.deleteFile(req.file.path);
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // If new file is uploaded, we bump the version and archive old ones, returning a new Content doc
    if (req.file) {
      const latestContent = await Content.findOne({ skeletonId: content.skeletonId }).sort({ version: -1 });
      const nextVersion = latestContent ? latestContent.version + 1 : 1;

      // Archive all previous contents for this skeleton
      await Content.updateMany({ skeletonId: content.skeletonId, status: 'active' }, { status: 'archived' });

      const savedPath = await storageService.saveFile(req.file);

      const newContent = new Content({
        skeletonId: content.skeletonId,
        classNumber: content.classNumber,
        title: title || content.title,
        fileName: req.file.originalname,
        filePath: savedPath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user.id,
        version: nextVersion,
        status: 'active'
      });

      await newContent.save();

      return res.status(201).json({
        success: true,
        data: newContent,
        message: 'Content file replaced. New version created successfully'
      });
    }

    // If no file, we just update the title
    if (title !== undefined) {
      content.title = title;
      await content.save();
    }

    return res.status(200).json({
      success: true,
      data: content,
      message: 'Content updated successfully'
    });
  } catch (error) {
    if (req.file) {
      await storageService.deleteFile(req.file.path);
    }
    next(error);
  }
};

// DELETE /:id
exports.deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Delete file from disk
    await storageService.deleteFile(content.filePath);

    // Delete document
    await Content.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Content and physical file deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// GET /program-structure
exports.getProgramStructure = async (req, res, next) => {
  try {
    const skeletonFilter = {};
    if (req.user.role === 'student') {
      skeletonFilter.status = 'published';
    }

    const skeletons = await ContentSkeleton.find(skeletonFilter).sort({ classNumber: 1 });

    const result = [];
    for (const skeleton of skeletons) {
      // Find all content items for this skeleton
      const contents = await Content.find({ skeletonId: skeleton._id }).sort({ version: -1 });
      
      result.push({
        classNumber: skeleton.classNumber,
        skeleton: {
          _id: skeleton._id,
          title: skeleton.title,
          timeline: skeleton.timeline,
          metadata: skeleton.metadata,
          status: skeleton.status,
          programId: skeleton.programId
        },
        contents: contents.map(c => ({
          _id: c._id,
          fileName: c.fileName,
          filePath: c.filePath,
          uploadedBy: c.uploadedBy,
          version: c.version,
          status: c.status
        }))
      });
    }

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
