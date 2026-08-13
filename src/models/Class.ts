import mongoose, { Model, Types } from "mongoose";

export type IClass = mongoose.Document & {
  _id: string;
  name: string;
  form: string;
  programme: Types.ObjectId;
  isNewCurriculum: boolean;
  isDeleted: boolean;
  isSuspended: boolean;
};

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    form: { type: String, required: true, },
    programme: { type: mongoose.Schema.Types.ObjectId, ref: "Programme", required: true },
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

classSchema.index({ programme: 1 });
classSchema.index({ form: 1 }); // only if you use the `form` filter a lot


const Class: Model<IClass> =
  mongoose.models.Class || mongoose.model<IClass>("Class", classSchema);

export default Class;
