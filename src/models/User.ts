import mongoose, { Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export type IUser = mongoose.Document & {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  gender?: string;
  phoneNumber?: string;
  subjects?: Types.ObjectId[];
  assignedClasses?: Types.ObjectId[];
  deviceToken?: string;
  staffNumber: string;
  pushNotificationAllowed?: boolean;
  isDeleted?: boolean;
  userPermissions: string[];
  isSuspended?: boolean;
  deleteBy?: string;

  // Add the comparePassword method to the interface
  comparePassword(password: string): Promise<boolean>;
};

const userSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, trim: true, required: true },
    role: { type: String, required: true, default: "teacher" },
    phoneNumber: { type: String, default: null },
    gender: { type: String, default: null },
    subjects: { type: [Types.ObjectId], ref: "Subject", default: [] },
    assignedClasses: { type: [Types.ObjectId], ref: "Class", default: [] },
    staffNumber: { type: String, required: true, unique: true, index: true },
    userPermissions: { type: [String], default: [] },
    deviceToken: {
      type: String,
      trim: true,
      default: null
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
    deleteBy: {
      type: String,
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
  }
);

userSchema.pre("save", async function (next) {
  try {
    const user = this as IUser;
    if (user.isModified("password")) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT as string, 10) || 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
    return next();
  } catch (e) {
    return next(e as mongoose.CallbackError);
  }
});

userSchema.methods.comparePassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch {
    return false;
  }
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
