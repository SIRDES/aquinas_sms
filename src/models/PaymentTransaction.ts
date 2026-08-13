import mongoose, { Model, Types } from "mongoose";

export type IPaymentTransactions = mongoose.Document & {
  _id: string;
  numberOfTimesUsed: number;
  responseMessage?: string;
  code: string;
  status: string;
  examType: string;
  student: Types.ObjectId;
  batchId: Types.ObjectId;
  msisdn: string;
  network: string;
  isDeleted: boolean;
  isSuspended: boolean;
};

const paymentTransactionSchema = new mongoose.Schema(
  {
    numberOfTimesUsed: { type: Number, required: true },
    code: { type: String, required: true },
    responseMessage: { type: String, default: null },
    student: { type: Types.ObjectId, ref: "Student", required: true },
    examType: { type: String, require: true },
    status: { type: String, require: true },
    batchId: { type: Types.ObjectId, required: true },
    msisdn: { type: String, required: true },
    network: { type: String, required: true },
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

const PaymentTransaction: Model<IPaymentTransactions> =
  mongoose.models.PaymentTransaction ||
  mongoose.model<IPaymentTransactions>(
    "PaymentTransaction",
    paymentTransactionSchema
  );

export default PaymentTransaction;
