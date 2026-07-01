const College = require('../models/College');
const Course = require('../models/Course');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { collegeId, courseCode } = req.body;
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
        return res.status(403).json({ message: 'Moderators can only create courses for their own college' });
      }
    }

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

    const courses = await Course.find(filter).populate('collegeId', 'name');
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const course = await Course.findById(id).populate('collegeId', 'name');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // If moderator, verify the course belongs to their college
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (course.collegeId._id.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only access courses from their own college' });
      }
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update course by ID
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { collegeId, courseCode } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // If moderator, verify they are associated with the college
    let moderatorCollege = null;
    if (userRole === 'moderator') {
      moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      // If collegeId is provided in update, it must be the same as moderator's college
      if (collegeId && collegeId !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only update courses for their own college' });
      }
      // If collegeId is not provided, we will use the existing course's collegeId for validation
    }

    // If collegeId is provided, verify it exists
    if (collegeId) {
      const college = await College.findById(collegeId);
      if (!college) {
        return res.status(400).json({ message: 'College not found' });
      }
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { collegeId, courseCode },
      { new: true, runValidators: true }
    ).populate('collegeId', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // If moderator, verify the course belongs to their college (after update)
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      // Use the updated collegeId if provided, otherwise existing
      const effectiveCollegeId = collegeId || course.collegeId._id;
      if (effectiveCollegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only update courses for their own college' });
      }
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
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the course first to check college
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // If moderator, verify the course belongs to their college
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only delete courses from their own college' });
      }
    }

    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
