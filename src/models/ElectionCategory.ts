import mongoose, { Model, Types } from "mongoose";

export type IElectionCategory = mongoose.Document & {
  _id: string;
  name: string;
  shortCode: string;
  electionId: Types.ObjectId;
  isDeleted: boolean;
  isSuspended: boolean;
};

const electionCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    shortCode: { type: String, required: true },
    electionId: { type: Types.ObjectId, ref: "Election", required: true },
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

// Ensure name is unique within an election
electionCategorySchema.index({ electionId: 1, name: 1 }, { unique: true });
// Ensure shortCode is unique within an election
electionCategorySchema.index({ electionId: 1, shortCode: 1 }, { unique: true });

// Handle duplicate key errors for name and shortCode
electionCategorySchema.post("save", function (error: any, doc: any, next: any) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    if (error.keyPattern && error.keyPattern.name) {
      next(new Error("Category name exists"));
    } else if (error.keyPattern && error.keyPattern.shortCode) {
      next(new Error("Short code exists"));
    } else {
      next(new Error("Duplicate key error"));
    }
  } else {
    next(error);
  }
});

const ElectionCategory: Model<IElectionCategory> =
  mongoose.models.ElectionCategory ||
  mongoose.model<IElectionCategory>("ElectionCategory", electionCategorySchema);

export default ElectionCategory;
