import mongoose from 'mongoose';

const childSchema = new mongoose.Schema({
  fullname: { 
    type: String, 
  },
  email: {
    type: String,
  },
  birthday: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE'],
  },
}, { timestamps: true });

const Child = mongoose.model('Child', childSchema);

export default Child;
