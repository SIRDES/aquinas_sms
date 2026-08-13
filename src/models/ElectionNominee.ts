import mongoose, { Model, Types } from "mongoose";

export type IElectionNominee = mongoose.Document & {
  _id: string;
  nomineeCode: string;
  categoryId: Types.ObjectId;
  electionId: Types.ObjectId;
  nomineeId: Types.ObjectId;
  // numberOfVotes: number;
  isDeleted: boolean;
  isSuspended: boolean;
};

const electionNomineeSchema = new mongoose.Schema(
  {
    nomineeCode: { type: String, required: true },
    // numberOfVotes: { type: Number, required: true, default: 0 },
    electionId: { type: Types.ObjectId, ref: "Election", required: true },
    categoryId: {
      type: Types.ObjectId,
      ref: "ElectionCategory",
      required: true,
    },
    nomineeId: { type: Types.ObjectId, ref: "ElectionUser", required: true },
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

electionNomineeSchema.index(
  { electionId: 1, categoryId: 1, nomineeId: 1 },
  { unique: true }
);

electionNomineeSchema.post("save", function (error: any, doc: any, next: any) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("Nominee already exists"));
  } else {
    next(error);
  }
});

electionNomineeSchema.post(
  "findOneAndUpdate",
  function (error: any, doc: any, next: any) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      next(new Error("Nominee already exists"));
    } else {
      next(error);
    }
  }
);

const ElectionNominee: Model<IElectionNominee> =
  mongoose.models.ElectionNominee ||
  mongoose.model<IElectionNominee>("ElectionNominee", electionNomineeSchema);

export default ElectionNominee;
