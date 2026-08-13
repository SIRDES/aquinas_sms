import mongoose, { Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export type IElectionUser = mongoose.Document & {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  aliasName?: string;
  studentId?: string;
  electionId: Types.ObjectId;
  isPasswordChanged?: boolean;
  phoneNumber?: string;
  isDeleted?: boolean;
  isSuspended?: boolean;
  deleteBy?: string;

  // Add the comparePassword method to the interface
  comparePassword(password: string): Promise<boolean>;
};

const electionUserSchema = new mongoose.Schema<IElectionUser>(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    aliasName: { type: String, default: null },
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
      required: true,
    },
    password: { type: String, trim: true, required: true },
    role: { type: String, required: true },
    phoneNumber: { type: String, default: null },
    studentId: { type: String, default: null },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isPasswordChanged: {
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
  }
);

// Handle duplicate key errors for email
electionUserSchema.post("save", function (error: any, doc: any, next: any) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    if (error.keyPattern && error.keyPattern.email) {
      next(new Error("Email/Username already exists"));
    } else {
      next(new Error("Duplicate key error"));
    }
  } else {
    next(error);
  }
});

electionUserSchema.pre("save", async function (next) {
  try {
    const user = this as IElectionUser;
    if (user.isModified("password")) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT as string, 10) || 10;
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
    return next();
  } catch (e) {
    return next(e as mongoose.CallbackError);
  }
});

electionUserSchema.methods.comparePassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch {
    return false;
  }
};

const ElectionUser: Model<IElectionUser> =
  mongoose.models.ElectionUser ||
  mongoose.model<IElectionUser>("ElectionUser", electionUserSchema);

export default ElectionUser;
