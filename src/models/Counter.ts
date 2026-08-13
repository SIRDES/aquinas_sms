import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICounter extends Document {
  id: string; // The sequence name (e.g., 'saleNumber')
  seq: number;
}

const counterSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  // yearOfAdmission: { type: Number, required: true },
  seq: { type: Number, default: 0 },
});

// counterSchema.index({ yearOfAdmission: 1, id: 1 }, { unique: true });

const Counter: Model<ICounter> = mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);

export default Counter;
