import mongoose, { Model, Types } from "mongoose";

export type IAdminSetting = mongoose.Document & {
  _id: string;
  isAdmissionOpen: boolean;
  smsProvider: string;
  currentAdmissionId?: Types.ObjectId;

};

const adminSettingSchema = new mongoose.Schema<IAdminSetting>(
  {
    isAdmissionOpen: { type: Boolean, required: true },
    smsProvider: { type: String, required: true },
    currentAdmissionId: { type: Types.ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);


const AdminSetting: Model<IAdminSetting> =
  mongoose.models.AdminSetting || mongoose.model<IAdminSetting>("AdminSetting", adminSettingSchema);

export default AdminSetting;
