import mongoose, { Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export type IStudent = mongoose.Document & {
  _id: string;
  firstName: string;
  lastName?: string;
  password: string;
  gender: string;
  dob: Date;
  parentPhoneNumber?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  subjects: Types.ObjectId[];
  classId: Types.ObjectId;
  deviceToken: string | null;
  studentId: string;
  ssId?: string;
  cassRefID?: string;
  yearOfAdmission: string;
  yearGroup: string; // for promotion
  pushNotificationAllowed?: boolean;
  isDeleted?: boolean;
  isSuspended?: boolean;
  deleteBy?: string;
  suspendedBy?: string;

  // Add the comparePassword method to the interface
  comparePassword(password: string): Promise<boolean>;
};

const studentSchema = new mongoose.Schema<IStudent>(
  {
    parentEmail: { type: String, default: null },
    firstName: { type: String, required: true, trim: true, uppercase: true },
    lastName: { type: String, default: "", trim: true, uppercase: true },
    password: { type: String, trim: true, required: true },
    yearGroup: { type: String, trim: true },
    yearOfAdmission: { type: String, trim: true },
    parentPhoneNumber: { type: String, default: null },
    parentFirstName: { type: String, default: null, trim: true, uppercase: true },
    parentLastName: { type: String, default: null, trim: true, uppercase: true },
    dob: { type: Date, default: null },
    gender: { type: String, required: true, default: "male" },
    subjects: { type: [Types.ObjectId], ref: "Subject", default: [] },
    ssId: { type: String, default: null, index: true },
    cassRefID: { type: String, default: null, index: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    studentId: { type: String, required: true, unique: true, index: true, trim: true, uppercase: true },
    deviceToken: {
      type: String,
      default: null,
    },
    pushNotificationAllowed: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    deleteBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ classId: 1 });

studentSchema.index({ subjects: 1, yearGroup: 1 });

studentSchema.pre("save", async function (next) {
  try {
    const user = this as IStudent;
    if (user.isModified("password")) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT as string, 10) || 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
    return next();
  } catch (e) {
    return next(e as mongoose.CallbackError);
  }
});

studentSchema.methods.comparePassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch {
    return false;
  }
};

const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", studentSchema);

export default Student;
