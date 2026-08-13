import mongoose, { Model, Types } from "mongoose";

export type IStudentAttendanceLog = mongoose.Document & {
  _id: string;
  date: Date;
  studentId: Types.ObjectId;
  morningTime: string;
  afternoonTime: string;
};

const studentAttendanceLogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    studentId: { type: Types.ObjectId, ref: "Student", required: true },
    morningTime: { type: String, required: true },
    afternoonTime: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);


studentAttendanceLogSchema.index({ date: 1, studentId: 1 }, { unique: true });

const StudentAttendanceLog: Model<IStudentAttendanceLog> =
  mongoose.models.StudentAttendanceLog ||
  mongoose.model<IStudentAttendanceLog>("StudentAttendanceLog", studentAttendanceLogSchema);

export default StudentAttendanceLog;
