import mongoose, { Model } from "mongoose";

export type IVotingUssdSession = mongoose.Document & {
  _id: string;
  sessionId: string;
  msisdn: string;
  data: string;
  network: string;
  to?: string;
  mainStage?: string;
  stage?: string;
  nomineeCode?: string;
  nomineeName?: string;
  nomineeId?: string;
  categoryId?: string;
  categoryName?: string;
  paymentShortDescription?: string;
  numberOfVotes?: number;
  amount?: number;
};

const votingUssdSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    data: { type: String, required: true },
    network: { type: String, required: true },
    msisdn: { type: String, required: true },
    stage: { type: String, default: null },
    to: { type: String, default: null },
    mainStage: { type: String, default: null },
    nomineeCode: { type: String, default: null },
    nomineeName: { type: String, default: null },
    nomineeId: { type: String, default: null },
    categoryId: { type: String, default: null },
    categoryName: { type: String, default: null },
    paymentShortDescription: { type: String, default: null },
    numberOfVotes: { type: Number, default: null },
    amount: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
);

const VotingUssdSession: Model<IVotingUssdSession> =
  mongoose.models.VotingUssdSession ||
  mongoose.model<IVotingUssdSession>(
    "VotingUssdSession",
    votingUssdSessionSchema
  );

export default VotingUssdSession;
