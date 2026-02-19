import mongoose from 'mongoose';

const dentistHistorySchema = new mongoose.Schema(
  {
    dentistName: {
      type: String,
      trim: true,
    },
    // Date-only in format YYYY-MM-DD
    dentistDay: {
      type: String,
      trim: true,
      required: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      default: 'USER',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    line_user_id: {
      type: String,
    },
    facebook_user_id: {
      type: String,
    },
    google_user_id: {
      type: String,
    },
    dentistName: {
      type: String,
      trim: true,
    },
    // Date-only in format YYYY-MM-DD to avoid timezone drift in UI
    dentistDay: {
      type: String,
      trim: true,
    },
    dentistHistory: {
      type: [dentistHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
