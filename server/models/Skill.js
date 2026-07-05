import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    category: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Skill', skillSchema);
