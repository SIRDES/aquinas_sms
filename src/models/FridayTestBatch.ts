import mongoose, { Model, Types } from "mongoose";

export type IFridayTestBatch = mongoose.Document & {
  _id: string;
  date: Date;
  name: string;
  subjectIds: Types.ObjectId[];
  academicYear?: Types.ObjectId;
  examType?: string;
  isNewCurriculum?: boolean;
  form: string;
  yearGroup: string;
  isSemester?: boolean;
  isDeleted: boolean;
  isSuspended: boolean;
};

const fridayTestBatchSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    name: { type: String, required: true },
    academicYear: { type: Types.ObjectId, ref: "AcademicYear" },
    examType: { type: String, default: "Friday Test" },
    form: { type: String, required: true },
    yearGroup: { type: String, required: true },
    isNewCurriculum: { type: Boolean, default: false },
    isSemester: { type: Boolean, default: false },
    subjectIds: { type: [Types.ObjectId], ref: "Subject", default: [] },
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

const FridayTestBatch: Model<IFridayTestBatch> =
  mongoose.models.FridayTestBatch ||
  mongoose.model<IFridayTestBatch>("FridayTestBatch", fridayTestBatchSchema);

export default FridayTestBatch;
