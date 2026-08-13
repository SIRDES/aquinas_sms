import mongoose, { Types } from "mongoose";

export type IPlacedStudent = mongoose.Document & {
  _id: string;
  firstName: string;
  lastName?: string;
  gender: string;
  dob?: Date;
  nationality?: string;
  religion?: string;
  religiousDenomination?: string;
  parentPhoneNumber?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  residentialStatus?: string;
  // subjects: Types.ObjectId[];
  // classId: Types.ObjectId;
  deviceToken: string | null;
  studentId?: string;
  admissionNumber: string;
  yearOfAdmission: string;
  status: string;  // placed, started,enrolled
  yearGroup: string; // for promotion
  pushNotificationAllowed?: boolean;
  isDeleted?: boolean;
  isSuspended?: boolean;
  deleteBy?: string;
  profileImage?: string;

  beceIndexNumber?: string;
  hashedBeceIndexNumber: string;
  csspsEnrolmentCode: string;
  placeOfBirth: string;
  jhsAttended: string;
  jhsType?: string;
  intersts: string;
  schoolAwards: string;
  positionsHeld: string;
  admissionProgramme: string;
  admissionCode: string;
  aggregate: number;
  rawScore: number;
  town: string;
  district: string;
  region: string;
  permanentAddress: string;
  fatherFirstName: string;
  fatherLastName: string;
  fatherOccupation: string;
  motherFirstName: string;
  motherLastName: string;
  motherOccupation: string;
  parentPostalAddress: string;
  parentResidentialAddress: string;
  parentAltPhoneNumber: string;
};
const PlacedStudentSchema = new mongoose.Schema<IPlacedStudent>(
  {
    parentEmail: { type: String, default: null },
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    yearGroup: { type: String },
    yearOfAdmission: { type: String },
    parentPhoneNumber: { type: String, default: null },
    parentAltPhoneNumber: { type: String, default: null },
    parentFirstName: { type: String, default: null },
    parentLastName: { type: String, default: null },
    admissionProgramme: { type: String, default: null },
    admissionCode: { type: String, default: null },
    profileImage: { type: String, default: null },
    dob: { type: Date, default: null },
    gender: { type: String, required: true, default: "male" },
    religion: { type: String, default: null },
    religiousDenomination: { type: String, default: null },
    nationality: { type: String, default: null },
    residentialStatus: { type: String, default: "day" },

    status: { type: String, required: true, default: "placed" },
    // subjects: { type: [Types.ObjectId], ref: "Subject", default: [] },
    // classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    studentId: { type: String, default: null },
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
    deleteBy: {
      type: String,
    },
    beceIndexNumber: {
      type: String,
      default: null,
    },
    hashedBeceIndexNumber: {
      type: String,
      required: true
    },
    placeOfBirth: { type: String, default: null },
    csspsEnrolmentCode: {
      type: String,
      default: null
    },
    jhsAttended: {
      type: String,
      default: null
    },
    jhsType: {
      type: String,
      default: null
    },
    intersts: { type: String, default: null },
    schoolAwards: { type: String, default: null },
    positionsHeld: { type: String, default: null },
    aggregate: {
      type: Number,
      default: 0
    },
    rawScore: {
      type: Number,
      default: 0,
    },
    town: {
      type: String,
      default: null
    },
    district: {
      type: String, default: null
    },
    region: {
      type: String, default: null
    },
    permanentAddress: {
      type: String, default: null
    },
    fatherFirstName: {
      type: String, default: null
    },
    fatherLastName: {
      type: String,
      default: null

    },
    fatherOccupation: {
      type: String,
      default: null

    },
    motherFirstName: {
      type: String,
      default: null

    },
    motherLastName: {
      type: String,
      default: null

    },
    motherOccupation: {
      type: String,
      default: null

    },
    parentPostalAddress: {
      type: String, default: null

    },
    parentResidentialAddress: {
      type: String,
      default: null
    },
  },
  { timestamps: true }
);

const PlacedStudent =
  mongoose.models.PlacedStudent || mongoose.model("PlacedStudent", PlacedStudentSchema);
export default PlacedStudent;
