import mongoose, { Model, Types } from "mongoose";

export type IAuditLog = mongoose.Document & {
  _id: string;
  userId: Types.ObjectId;
  action: string;
  createdAt: Date;
};

const auditLogsSchema = new mongoose.Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", auditLogsSchema);

export default AuditLog;
