import mongoose from 'mongoose';

const teethEventSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    childId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: true,
      index: true,
    },
    toothId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teeth',
    },
    toothCode: {
      type: String,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['ERUPTED', 'SHED', 'EXTRACTED', 'NOTE'],
      required: true,
    },
    eventDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    remark: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const TeethEvent =
  mongoose.models.TeethEvent || mongoose.model('TeethEvent', teethEventSchema);

export default TeethEvent;
