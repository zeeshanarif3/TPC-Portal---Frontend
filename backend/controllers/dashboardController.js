const College = require('../models/College');
const Session = require('../models/Session');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Contract = require('../models/Contract');

/**
 * GET /dashboard/stats?college=<collegeId>
 * Returns statistics for a college
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // const { collegeId } = req.query;
    const { college: collegeId } = req.query
    if (!collegeId) {
      return res.status(400).json({ message: 'College ID is required' });
    }

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Get sessions for this college
    const sessions = await Session.find({ collegeId });

    // Get courses for this college (via sessions or directly)
    const courses = await Course.find({ collegeId });

    // Get students count: sum of students in each course
    let totalStudents = 0;
    for (const course of courses) {
      const count = await Student.countDocuments({ courseId: course._id });
      totalStudents += count;
    }

    // Get total attendance records for sessions in this college
    const sessionIds = sessions.map(s => s._id);
    const totalAttendanceRecords = await Attendance.countDocuments({ sessionId: { $in: sessionIds } });

    // Get active contracts for sessions in this college
    const activeContracts = await Contract.countDocuments({
      sessionId: { $in: sessionIds },
      status: 'active'
    });

    // Get total trainers (unique trainers with active contracts in this college's sessions)
    const trainerIds = await Contract.distinct('trainerId', {
      sessionId: { $in: sessionIds },
      status: 'active'
    });
    const totalTrainers = trainerIds.length;

    res.status(200).json({
      college: {
        _id: college._id,
        name: college.name,
        pointOfContact: college.pointOfContact,
        location: college.location
      },
      statistics: {
        totalSessions: sessions.length,
        totalCourses: courses.length,
        totalStudents,
        totalAttendanceRecords,
        activeContracts,
        totalTrainers
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// const College = require('../models/College');
// const Session = require('../models/Session');
// const Course = require('../models/Course');
// const Student = require('../models/Student');
// const Attendance = require('../models/Attendance');
// const Contract = require('../models/Contract');

// /**
//  * GET /dashboard/stats?collegeId=<collegeId>
//  * Returns statistics for a college
//  */
// exports.getDashboardStats = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const userRole = req.user.role;
//     let collegeId = req.query.collegeId;

//     // If moderator, they can only access their own college
//     if (userRole === 'moderator') {
//       const moderatorCollege = await College.findOne({ moderatorId: userId });
//       if (!moderatorCollege) {
//         return res.status(404).json({ message: 'College not found for this moderator' });
//       }
//       collegeId = moderatorCollege._id.toString(); // Override with their college
//     }

//     if (!collegeId) {
//       return res.status(400).json({ message: 'College ID is required' });
//     }

//     // Verify college exists
//     const college = await College.findById(collegeId);
//     if (!college) {
//       return res.status(404).json({ message: 'College not found' });
//     }

//     // Get sessions for this college
//     const sessions = await Session.find({ collegeId });

//     // Get courses for this college (via sessions or directly)
//     const courses = await Course.find({ collegeId });

//     // Get students count: sum of students in each course
//     let totalStudents = 0;
//     for (const course of courses) {
//       const count = await Student.countDocuments({ courseId: course._id });
//       totalStudents += count;
//     }

//     // Get total attendance records for sessions in this college
//     const sessionIds = sessions.map(s => s._id);
//     const totalAttendanceRecords = await Attendance.countDocuments({ sessionId: { $in: sessionIds } });

//     // Get active contracts for sessions in this college
//     const activeContracts = await Contract.countDocuments({
//       sessionId: { $in: sessionIds },
//       status: 'active'
//     });

//     // Get total trainers (unique trainers with active contracts in this college's sessions)
//     const trainerIds = await Contract.distinct('trainerId', {
//       sessionId: { $in: sessionIds },
//       status: 'active'
//     });
//     const totalTrainers = trainerIds.length;

//     res.status(200).json({
//       college: {
//         _id: college._id,
//         name: college.name,
//         pointOfContact: college.pointOfContact,
//         location: college.location
//       },
//       statistics: {
//         totalSessions: sessions.length,
//         totalCourses: courses.length,
//         totalStudents,
//         totalAttendanceRecords,
//         activeContracts,
//         totalTrainers
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
