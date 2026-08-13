import mongoose, { Model, Types } from "mongoose";

export type IAdmission = mongoose.Document & {
  _id: string;
  date: Date;
  reportingDate: Date;
  name: string;
  admissionYear: string;
  academicYear?: Types.ObjectId;
  admissionLetterRefNo?: string;
  isNewCurriculum?: boolean;
  isDeleted: boolean;
  isSuspended: boolean;
};

const admission = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    reportingDate: { type: Date, required: true },
    name: { type: String, required: true },
    admissionLetterRefNo: { type: String, required: true },
    admissionYear: { type: String, required: true },
    academicYear: { type: Types.ObjectId, ref: "AcademicYear" },
    isNewCurriculum: { type: Boolean, default: true },
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
  }
);

const Admission: Model<IAdmission> =
  mongoose.models.Admission ||
  mongoose.model<IAdmission>("Admission", admission);

export default Admission;
