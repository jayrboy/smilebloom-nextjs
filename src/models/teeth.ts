import mongoose from 'mongoose';

const teethSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['DECIDUOUS', 'PERMANENT'],
  },
  description: {
    type: String,
  },
  start_occurrence_month: {
    type: Number,
  },
  end_occurrence_month: {
    type: Number,
  },
  start_destory_month: {
    type: Number,
  },
  end_destory_month: {
    type: Number,
  },
}, { timestamps: true });

const Teeth = mongoose.model('Teeth', teethSchema);

export default Teeth;
