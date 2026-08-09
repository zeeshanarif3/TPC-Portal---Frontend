const mongoose = require('mongoose');
const User = require('./User');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true },
  name: { type: String, required: true },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    required: true
  },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Ensure rollNumber is unique per course
StudentSchema.index({ courseId: 1, rollNumber: 1 }, { unique: true });

// Pre-save hook to autogenerate User account
StudentSchema.pre('save', async function(next) {
  if (this.isNew && !this.userId) {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: this.email });
      if (!user) {
        // Format DOB to YYYYMMDD for password
        let rawPassword;
        const dob = this.dob;
        if (typeof dob === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dob.split('T')[0])) {
          rawPassword = dob.split('T')[0].replace(/-/g, '');
        } else if (dob instanceof Date) {
          const yyyy = dob.getUTCFullYear();
          const mm = String(dob.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(dob.getUTCDate()).padStart(2, '0');
          rawPassword = `${yyyy}${mm}${dd}`;
        } else {
          const dateObj = new Date(dob);
          if (isNaN(dateObj.getTime())) {
            return next(new Error('Invalid date of birth format'));
          }
          const yyyy = dateObj.getUTCFullYear();
          const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(dateObj.getUTCDate()).padStart(2, '0');
          rawPassword = `${yyyy}${mm}${dd}`;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        user = new User({
          name: this.name,
          email: this.email,
          password: hashedPassword,
          role: 'student',
          active: true
        });
        await user.save();
      }
      this.userId = user._id;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Pre-delete hook to remove the associated User account
StudentSchema.pre('findOneAndDelete', async function(next) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc && doc.userId) {
      await User.findByIdAndDelete(doc.userId);
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Student', StudentSchema);
