import mongoose, { Model, Types } from "mongoose";

export type IPaymentWithdrawals = mongoose.Document & {
  _id: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  lastPaymentTransaction: Types.ObjectId;
  firstPaymentTransaction: Types.ObjectId;
  isDeleted: boolean;
  isSuspended: boolean;
};

const paymentWithdrawalsSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
    lastPaymentTransaction: { type: Types.ObjectId, ref: "PaymentTransaction", required: true },
    firstPaymentTransaction: { type: Types.ObjectId, ref: "PaymentTransaction", required: true },
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

const PaymentWithdrawals: Model<IPaymentWithdrawals> =
  mongoose.models.PaymentWithdrawals ||
  mongoose.model<IPaymentWithdrawals>(
    "PaymentWithdrawals",
    paymentWithdrawalsSchema
  );

export default PaymentWithdrawals;
