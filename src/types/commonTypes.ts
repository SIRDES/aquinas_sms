import { AlertColor } from "@mui/material";
import { Date } from "mongoose";

export type BatchDetailsType = {
  form: "";
  amount: number;
  startDate: Date;
  endDate: Date;
};
export type SnackbarType = {
  open: boolean;
  message: string;
  severity: AlertColor | undefined;
};
export type SubjectType = {
  [key: string]: {
    id: string;
    name: string;
    score: number | string;
    type: string;
    grade: string;
    remarks: string;
    createdAt: Date;
    updatedAt: Date;
  };
};

export type StudentType = {
  id: string;
  parentFirstName: string;
  paymentType: "FULL PAYMENT" | "PART PAYMENT";
  parentAreaOfResidence?: string;
  parentEmail?: string;
  coreSubjects: SubjectType;
  onScholarship: "NO" | "YES";
  createdAt: Date;
  parentOccupation?: string;
  amountPaid: number;
  middleName?: string;
  phoneNumber?: string;
  email?: string;
  selectedElectiveSubjects: SubjectType;
  lastName: string;
  programme: string;
  schoolName: string;
  firstName: string;
  parentMiddleName?: string;
  updatedAt: Date;
  gender: "MALE" | "FEMALE";
  parentPhoneNumber: string;
  studentId: string;
  areaOfResidence: string;
  parentLastName: string;
};


export type AssessmentModesType = "individual" | "midSem" | "practical" | "groupWork" | "supervised"


export interface TimeLogType {
  day: number;
  morningTime: string;
  afternoonTime: string;
}

export interface StudentAttendanceLogType {
  no: string;
  name: string;
  dept: string;
  studentId: string;
  timeLogs: TimeLogType[];
}