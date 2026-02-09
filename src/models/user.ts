import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true,
  },
  password: { 
    type: String, 
    required: true,
  },
  email: {
    type: String,
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
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
