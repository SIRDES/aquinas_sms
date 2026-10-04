import mongoose, { Model, Types } from "mongoose";

export type ISMSResult = mongoose.Document & {
  _id: string;
  sms_id: string;
  status: string;
  message: string;
  // batch_id: Types.ObjectId;
  phoneNumber: string;
  smsProvider: string;
  // batchType: string;
  // student?: Types.ObjectId;
};

const smsResultSchema = new mongoose.Schema<ISMSResult>(
  {
    sms_id: { type: String, required: true, index: true },
    status: { type: String, required: true, index: true },
    message: { type: String, trim: true, required: true },
    phoneNumber: { type: String, required: true },
    smsProvider: {
      type: String,
      index: true,
      default: "ARKESEL",
      enum: ["ARKESEL", "MNOTIFY", "NALO"],
    },
  },
  {
    timestamps: true,
    id: false,
    toJSON: {
      getters: true,
    },
    toObject: {
      getters: true,
    },
  },
);


// smsResultSchema.index({ status: 1 });

const SMSResult: Model<ISMSResult> =
  mongoose.models.SMSResult ||
  mongoose.model<ISMSResult>("SMSResult", smsResultSchema);

export default SMSResult;
