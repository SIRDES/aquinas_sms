import mongoose, { Model, Types } from "mongoose";

export type IExamScore = mongoose.Document & {
  _id: string;
  marks: number;
  grade: string;
  remarks: string;
  subject: Types.ObjectId;
  student: Types.ObjectId;
  academinYear: Types.ObjectId;
  semester: Types.ObjectId;
  isNewCurriculum: boolean;
  isDeleted: boolean;
  isSuspended: boolean;
};

const examScoreSchema = new mongoose.Schema(
  {
    marks: { type: Number, required: true },
    grade: { type: String, required: true },
    remarks: { type: String, required: true },
    subject: { type: Types.ObjectId, ref: "Subject", required: true },
    student: { type: Types.ObjectId, ref: "Student", required: true },
    academinYear: {
      type: Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    semester: { type: Types.ObjectId, ref: "Semester", required: true },
    isNewCurriculum: { type: Boolean, required: true },
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

const ExamScore: Model<IExamScore> =
  mongoose.models.Score || mongoose.model<IExamScore>("ExamScore", examScoreSchema);

export default ExamScore;
