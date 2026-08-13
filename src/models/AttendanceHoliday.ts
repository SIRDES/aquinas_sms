import mongoose, { Model, Types } from "mongoose";

export type IAttendanceHoliday = mongoose.Document & {
  _id: string;
  date: Date;
  description: string;
  duration: string;
};

const attendanceHolidaySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, index: true, unique: true },
    description: { type: String, required: true },
    duration: { type: String, enum: ['morning', 'afternoon', 'full_day'], default: 'full_day' },
  },
  {
    timestamps: true,
  }
);

const AttendanceHoliday: Model<IAttendanceHoliday> =
  mongoose.models.AttendanceHoliday ||
  mongoose.model<IAttendanceHoliday>("AttendanceHoliday", attendanceHolidaySchema);

export default AttendanceHoliday;
