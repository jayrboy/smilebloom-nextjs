import mongoose from 'mongoose';

const teethSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['DECIDUOUS', 'PERMANENT'],
      required: true,
    },
    arch: {
      type: String,
      enum: ['UPPER', 'LOWER'],
      required: true,
    },
    side: {
      type: String,
      enum: ['LEFT', 'RIGHT'],
      required: true,
    },
    tooth_kind: {
      type: String,
      enum: ['INCISOR', 'CANINE', 'MOLAR', 'PREMOLAR'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    name_th: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      index: true,
    },
    start_occurrence_month: {
      type: Number,
      required: true,
    },
    end_occurrence_month: {
      type: Number,
      required: true,
    },
    // For deciduous teeth (shedding/replace period) - optional for permanent teeth
    start_destory_month: {
      type: Number,
    },
    end_destory_month: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Teeth = mongoose.models.Teeth || mongoose.model('Teeth', teethSchema);

export default Teeth;
