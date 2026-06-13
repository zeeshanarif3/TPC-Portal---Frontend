const Student = require('../models/Student');
const Course = require('../models/Course');

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const { rollNumber, name, courseId } = req.body;

    // Verify that the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ message: 'Course not found' });
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
    const students = await Student.find().populate('courseId', 'courseCode');
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
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student by ID
exports.updateStudent = async (req, res) => {
  try {
    const { rollNumber, name, courseId } = req.body;

    // If courseId is provided, verify it exists
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(400).json({ message: 'Course not found' });
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
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
