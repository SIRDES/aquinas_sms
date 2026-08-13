import mongoose, { Model } from "mongoose";

export type IProgramme = mongoose.Document & {
  _id: string;
  name: string;
  isNewCurriculum: boolean;
  isDeleted: boolean;
  isSuspended: boolean;
};

const programmeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
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



const Programme: Model<IProgramme> =
  mongoose.models.Programme || mongoose.model<IProgramme>("Programme", programmeSchema);

export default Programme;
