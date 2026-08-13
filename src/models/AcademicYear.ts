import mongoose, { Model, Types } from "mongoose";

export type IAcademicYear = mongoose.Document & {
  _id: string;
  name: string;
  isDeleted: boolean;
  isSuspended: boolean;
};

const academicYearSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
    toObject: {
      getters: true,
    },
  }
);

const AcademicYear: Model<IAcademicYear> =
  mongoose.models.AcademicYear || mongoose.model<IAcademicYear>("AcademicYear", academicYearSchema);

export default AcademicYear;
