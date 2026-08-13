import mongoose, { Model, Types } from "mongoose";

export type IFridayTestScore = mongoose.Document & {
  _id: string;
  marks: number;
  classScore?: number;
  individualClassScore?: number;
  midSemScore?: number;
  practicalScore?: number;
  projectScore?: number;
  presentationScore?: number;
  assignmentScore?: number;
  groupWorkScore?: number;
  totalScore?: number;
  grade: string;
  remarks: string;
  subject: Types.ObjectId;
  student: Types.ObjectId;
  isNewCurriculum: boolean;
  fridayTestBatchId: Types.ObjectId;
  isDeleted: boolean;
  isSuspended: boolean;
};

const fridayTestScoreSchema = new mongoose.Schema(
  {
    marks: { type: Number, required: true },
    classScore: { type: Number, default: 0 },
    projectScore: { type: Number, default: 0 },
    individualClassScore: { type: Number, default: 0 },
    midSemScore: { type: Number, default: 0 },
    practicalScore: { type: Number, default: 0 },
    groupWorkScore: { type: Number, default: 0 },
    presentationScore: { type: Number, default: 0 },
    assignmentScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    grade: { type: String, required: true },
    remarks: { type: String, required: true },

    subject: { type: Types.ObjectId, ref: "Subject", required: true },
    student: { type: Types.ObjectId, ref: "Student", required: true },

    fridayTestBatchId: {
      type: Types.ObjectId,
      ref: "FridayTestBatch",
      required: true,
    },

    isNewCurriculum: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

//////////////////////////////
// 🚀 PERFORMANCE INDEXES
//////////////////////////////

// 🔥 MAIN FILTER INDEX (THIS FIXES YOUR 5s QUERY)
fridayTestScoreSchema.index({
  fridayTestBatchId: 1,
  isDeleted: 1,
  isSuspended: 1,
});

// 🔥 JOIN ACCELERATION
fridayTestScoreSchema.index({
  fridayTestBatchId: 1,
  student: 1,
});

// 🔒 DATA INTEGRITY (NO DUPLICATE SCORES)
fridayTestScoreSchema.index(
  { fridayTestBatchId: 1, student: 1, subject: 1 },
  { unique: true }
);

//////////////////////////////

const FridayTestScore: Model<IFridayTestScore> =
  mongoose.models.FridayTestScore ||
  mongoose.model<IFridayTestScore>("FridayTestScore", fridayTestScoreSchema);

export default FridayTestScore;
