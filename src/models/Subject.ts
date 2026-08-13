import mongoose, { Model } from "mongoose";

export type ISubject = mongoose.Document & {
  _id: string;
  name: string;
  shortName: string;
  type: string;
  isNewCurriculum: boolean;
  isNoneScoring: boolean;
  isDeleted: boolean;
  isSuspended: boolean;
};

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, uppercase: true },
    shortName: { type: String, required: true, trim: true, uppercase: true },
    type: { type: String, required: true },
    isNewCurriculum: { type: Boolean, required: true },
    isNoneScoring: { type: Boolean, default: false },
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
  },
);

const Subject: Model<ISubject> =
  mongoose.models.Subject || mongoose.model<ISubject>("Subject", subjectSchema);

export default Subject;
