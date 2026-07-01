const Student = require('../models/Student');
const Course = require('../models/Course');
const College = require('../models/College');

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const { rollNumber, name, courseId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // If moderator, verify they are associated with the college
    let moderatorCollege = null;
    if (userRole === 'moderator') {
      moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
    }

    // Verify that the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: 'Course not found' });
    }

    // If moderator, verify the course belongs to their college
    if (userRole === 'moderator') {
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only create students for courses in their own college' });
      }
    }

    const student = new Student({ rollNumber, name, courseId });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Student with this roll number already exists in the course' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = {};
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      // Get courses for this college, then students in those courses
      const courses = await Course.find({ collegeId: moderatorCollege._id });
      const courseIds = courses.map(c => c._id);
      filter = { courseId: { $in: courseIds } };
    }

    const students = await Student.find(filter).populate('courseId', 'courseCode');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('courseId', 'courseCode');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // If moderator, verify the student's course belongs to their college
    const userRole = req.user.role;
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: req.user.id });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (student.courseId === null || !student.courseId.collegeId) {
        // Populate might not have populated the collegeId, so we need to fetch the course
        const course = await Course.findById(student.courseId);
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
        if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
          return res.status(403).json({ message: 'Moderators can only access students from courses in their own college' });
        }
      } else {
        // If the course object is populated with collegeId
        if (student.courseId.collegeId.toString() !== moderatorCollege._id.toString()) {
          return res.status(403).json({ message: 'Moderators can only access students from courses in their own college' });
        }
      }
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student by ID
exports.updateStudent = async (req, res) => {
  try {
    const { rollNumber, name, courseId } = req.body;
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

    // If courseId is provided, verify it exists
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(400).json({ message: 'Course not found' });
      }
      // If moderator, verify the course belongs to their college
      if (userRole === 'moderator') {
        if (!moderatorCollege) {
          return res.status(404).json({ message: 'College not found for this moderator' });
        }
        if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
          return res.status(403).json({ message: 'Moderators can only update students for courses in their own college' });
        }
      }
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { rollNumber, name, courseId },
      { new: true, runValidators: true }
    ).populate('courseId', 'courseCode');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // If moderator, verify the student's course belongs to their college (after update)
    if (userRole === 'moderator') {
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      // Use the updated courseId if provided, otherwise existing
      const effectiveCourseId = courseId || student.courseId._id;
      const course = await Course.findById(effectiveCourseId);
      if (!course) {
        return res.status(400).json({ message: 'Course not found' });
      }
      if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
        return res.status(403).json({ message: 'Moderators can only update students for courses in their own college' });
      }
    }

    res.status(200).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Student with this roll number already exists in the course' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete student by ID
exports.deleteStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the student first to check course
    const student = await Student.findById(req.params.id).populate('courseId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // If moderator, verify the student's course belongs to their college
    if (userRole === 'moderator') {
      const moderatorCollege = await College.findOne({ moderatorId: userId });
      if (!moderatorCollege) {
        return res.status(404).json({ message: 'College not found for this moderator' });
      }
      if (student.courseId === null || !student.courseId.collegeId) {
        // Populate might not have populated the collegeId, so we need to fetch the course
        const course = await Course.findById(student.courseId);
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
        if (course.collegeId.toString() !== moderatorCollege._id.toString()) {
          return res.status(403).json({ message: 'Moderators can only delete students from courses in their own college' });
        }
      } else {
        // If the course object is populated with collegeId
        if (student.courseId.collegeId.toString() !== moderatorCollege._id.toString()) {
          return res.status(403).json({ message: 'Moderators can only delete students from courses in their own college' });
        }
      }
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
