import mongoose, { Model, Types } from "mongoose";

export type IVotingPaymentTransactions = mongoose.Document & {
  _id: string;
  numberOfVotes: number;
  responseMessage?: string;
  status: string;
  nomineeId: Types.ObjectId;
  nomineeCode: string;
  electionId: Types.ObjectId;
  categoryId: Types.ObjectId;
  amount: number;
  msisdn: string;
  network: string;
  isDeleted: boolean;
  isSuspended: boolean;
};

const votingPaymentTransactionSchema = new mongoose.Schema(
  {
    numberOfVotes: { type: Number, required: true, default: 0 },
    responseMessage: { type: String, default: null },
    status: { type: String, require: true },
    electionId: { type: Types.ObjectId, required: true },
    nomineeId: { type: Types.ObjectId, required: true },
    nomineeCode: { type: String, required: true },
    categoryId: { type: Types.ObjectId, required: true },
    amount: { type: Number, required: true, default: 0 },
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

const VotingPaymentTransaction: Model<IVotingPaymentTransactions> =
  mongoose.models.VotingPaymentTransaction ||
  mongoose.model<IVotingPaymentTransactions>(
    "VotingPaymentTransaction",
    votingPaymentTransactionSchema
  );

export default VotingPaymentTransaction;
