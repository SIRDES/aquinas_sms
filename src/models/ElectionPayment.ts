import mongoose, { Model, Types } from "mongoose";

export type IElectionPayments = mongoose.Document & {
  _id: string;
  numberOfVotes: number;
  responseMessage?: string;
  nomineeCode: string;
  status: string;
  nomineeId: Types.ObjectId;
  electionId: Types.ObjectId;
  msisdn: string;
  network: string;
  isDeleted: boolean;
  isSuspended: boolean;
};

const electionPaymentSchema = new mongoose.Schema(
  {
    numberOfVotes: { type: Number, required: true },
    nomineeCode: { type: String, required: true },
    responseMessage: { type: String, default: null },
    nomineeId: { type: Types.ObjectId, ref: "Student", required: true },
    status: { type: String, require: true },
    electionId: { type: Types.ObjectId, required: true },
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

const ElectionPayment: Model<IElectionPayments> =
  mongoose.models.ElectionPayment ||
  mongoose.model<IElectionPayments>(
    "ElectionPayment",
    electionPaymentSchema
  );

export default ElectionPayment;
