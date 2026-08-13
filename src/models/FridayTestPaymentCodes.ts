import mongoose, { Model, Types } from "mongoose";

export type IFridayTestPaymentCode = mongoose.Document & {
  _id: string;
  code: string;
  numberOfTimesUsed: number;
  studentNumber: string;
  fridayTestBatchName: string;
  isDeleted: boolean;
  isSuspended: boolean;
};

const fridayTestPaymentCodeSchema = new mongoose.Schema(
  {
    numberOfTimesUsed: { type: Number, required: true },
    code: { type: String, required: true },
    studentNumber: { type: String, required: true },
    fridayTestBatchName: { type: String, required: true },
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

const FridayTestPaymentCode: Model<IFridayTestPaymentCode> =
  mongoose.models.FridayTestPaymentCode ||
  mongoose.model<IFridayTestPaymentCode>(
    "FridayTestPaymentCode",
    fridayTestPaymentCodeSchema
  );

export default FridayTestPaymentCode;
