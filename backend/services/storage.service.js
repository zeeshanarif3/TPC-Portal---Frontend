const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../uploads/content');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Multer file filter to accept only PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    const error = new Error('Only PDF files are allowed');
    error.status = 400;
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage: diskStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});

/**
 * Saves/processes the uploaded file.
 * Returns the relative path from the backend directory root.
 * @param {Object} file - The multer file object
 * @returns {Promise<string>} - File path
 */
const saveFile = async (file) => {
  if (!file) {
    throw new Error('No file provided');
  }
  // Store path relative to the backend directory
  const relativePath = path.relative(path.join(__dirname, '..'), file.path);
  return relativePath;
};

/**
 * Deletes a file from the disk.
 * @param {string} filePath - The path to the file
 */
const deleteFile = async (filePath) => {
  if (!filePath) return;
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
  try {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error('Error deleting file:', err);
  }
};

/**
 * Generates download URL or relative path for the file.
 * @param {string} filePath - The file path
 * @returns {string} - File URL path
 */
const getFileUrl = (filePath) => {
  if (!filePath) return '';
  return `/uploads/content/${path.basename(filePath)}`;
};

module.exports = {
  upload,
  saveFile,
  deleteFile,
  getFileUrl
};
