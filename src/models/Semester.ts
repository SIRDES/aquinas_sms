import mongoose, { Model, Types } from "mongoose";

export type ISemester = mongoose.Document & {
  _id: string;
  name: string;
  isDeleted: boolean;
  isSuspended: boolean;
};

const semesterSchema = new mongoose.Schema(
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

const Semester: Model<ISemester> =
  mongoose.models.Semester || mongoose.model<ISemester>("Semester", semesterSchema);

export default Semester;
