const Course = require('../models/Course');
const College = require('../models/College');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { collegeId, courseCode } = req.body;

    // Verify that the college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(400).json({ message: 'College not found' });
    }

    const course = new Course({ collegeId, courseCode });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course with this code already exists in the college' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('collegeId', 'name');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('collegeId', 'name');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update course by ID
exports.updateCourse = async (req, res) => {
  try {
    const { collegeId, courseCode } = req.body;

    // If collegeId is provided, verify it exists
    if (collegeId) {
      const college = await College.findById(collegeId);
      if (!college) {
        return res.status(400).json({ message: 'College not found' });
      }
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { collegeId, courseCode },
      { new: true, runValidators: true }
    ).populate('collegeId', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course with this code already exists in the college' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete course by ID
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
