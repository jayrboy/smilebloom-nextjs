import mongoose from 'mongoose';

const teethEventSchema = new mongoose.Schema({
  type: { 
    type: String,
    enum: ['NEW', 'DELETE'],
  },
  remark: {
    type: String,
  },
}, { timestamps: true });

const TeethEvent = mongoose.model('TeethEvent', teethEventSchema);

export default TeethEvent;
