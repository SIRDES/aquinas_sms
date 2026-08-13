import mongoose, { Model, Types } from "mongoose";

export type ISMSResult = mongoose.Document & {
  _id: string;
  sms_id: string;
  status: string;
  message: string;
  // batch_id: Types.ObjectId;
  phoneNumber: string;
  // batchType: string;
  // student?: Types.ObjectId;
};

const smsResultSchema = new mongoose.Schema<ISMSResult>(
  {
    sms_id: { type: String, required: true },
    status: { type: String, required: true },
    message: { type: String, trim: true, required: true },
    phoneNumber: { type: String, required: true },
    // student: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Student",
    //   default: null,
    //   required: false,
    // },
    // batch_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "FridayTestBatch",
    //   required: true,
    // },
    // batchType: { type: String, required: true, default: "Friday_Test" },
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

smsResultSchema.index({ sms_id: 1 });

smsResultSchema.index({ status: 1 });

const SMSResult: Model<ISMSResult> =
  mongoose.models.SMSResult ||
  mongoose.model<ISMSResult>("SMSResult", smsResultSchema);

export default SMSResult;
