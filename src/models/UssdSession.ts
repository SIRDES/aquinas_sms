import mongoose, { Model, Types } from "mongoose";

export type IUssdSession = mongoose.Document & {
  _id: string;
  sessionId: string;
  msisdn: string;
  data: string;
  network: string;
  to?: string;
  stage?: string;
  selectedWeek?: string;
  studentNumber?: string;
  numberOfPaymentCodeRetries: number;
  numberOfStudentNumberRetries: number;
  studentName?: string;
  studentId?: string;
  parentPhoneNumber?: string;
  selectedWeekId?: string;
  examType?: string;
  paymentShortDescription?: string;
  mainStage?: string;
  payementTransactionId?: string;
};

const ussdSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    data: { type: String, required: true },
    network: { type: String, required: true },
    msisdn: { type: String, required: true },
    stage: { type: String, default: null },
    to: { type: String, default: null },
    selectedWeek: { type: String, default: null },
    selectedWeekId: { type: String, default: null },
    examType: { type: String, default: null },
    studentNumber: { type: String, default: null },
    numberOfPaymentCodeRetries: { type: Number, default: 0 },
    numberOfStudentNumberRetries: { type: Number, default: 0 },
    studentName: { type: String, default: null },
    studentId: { type: String, default: null },
    parentPhoneNumber: { type: String, default: null },
    paymentShortDescription: { type: String, default: null },
    mainStage: { type: String, default: null },
    payementTransactionId: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

const UssdSession: Model<IUssdSession> =
  mongoose.models.UssdSession ||
  mongoose.model<IUssdSession>("UssdSession", ussdSessionSchema);

export default UssdSession;
