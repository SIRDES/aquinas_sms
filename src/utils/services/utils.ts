import axios from "axios";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
// replace card number with stars

export const contactNumbers = "0247199122/0240084448";
export const handleMaskCard = (cardNumber: string) => {
  let stars = "";
  for (
    let index = 0;
    index < cardNumber?.length - cardNumber?.slice(-4).length;
    index++
  ) {
    stars += "*";
  }
  return `${stars}${cardNumber?.slice(-4)}`;
};

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "GHC",
});
export const currencyFormatter = (value: number | bigint) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHC",
  });
  return formatter.format(value);
};

export function isGreaterThan24HourAgo(date: Date) {
  //                      hour  min  sec  milliseconds
  const twentyFourHrInMs = 24 * 60 * 60 * 1000;

  const twentyFourHoursAgo = Date.now() - twentyFourHrInMs;

  return new Date(date).getTime() <= twentyFourHoursAgo;
}

export const sortSubjects = (subject1: any, subject2: any) => {
  if (subject1?.name < subject2?.name) {
    return -1;
  }
  if (subject1?.name > subject2?.name) {
    return 1;
  }
  return 0;
};

export function removePlusSign(phoneNumber: string) {
  return phoneNumber.replace("+", "");
}

export const getRemarksAndGrade = (score: number) => {
  const value = Math.round(Number(score));
  if (value === 0) {
    return {
      remarks: "incomplete",
      grade: "ic",
    };
  }
  if (value < 0 || value > 100) {
    // alert("Score should be between 0 - 100");
    return {
      remarks: "Invalid score. Score should be between 0 - 100",
      grade: "ic",
    };
  } else if (value >= 80 && value <= 100) {
    return {
      remarks: "Excellent",
      grade: "A1",
    };
  } else if (value >= 70 && value < 80) {
    return {
      remarks: "Very Good",
      grade: "B2",
    };
  } else if (value >= 60 && value < 70) {
    return {
      remarks: "Good",
      grade: "B3",
    };
  } else if (value >= 55 && value < 60) {
    return {
      remarks: "Credit",
      grade: "C4",
    };
  } else if (value >= 50 && value < 55) {
    return {
      remarks: "Credit",
      grade: "C5",
    };
  } else if (value >= 45 && value < 50) {
    return {
      remarks: "Credit",
      grade: "C6",
    };
  } else if (value >= 40 && value < 45) {
    return {
      remarks: "Pass",
      grade: "D7",
    };
  } else if (value >= 35 && value < 40) {
    return {
      remarks: "Pass",
      grade: "E8",
    };
  } else {
    return {
      remarks: "Fail",
      grade: "F9",
    };
  }
};

// Format date for display

export const formatDate = (dateString: string | Date) => {
  return dayjs(dateString).format("YYYY-MM-DD HH:mm:ss");
};

const gradeCoreSubjects = [
  "67a7c20a65f7639968515146",
  "67a7c20a65f7639968515156",
  "67a7c20a65f763996851515d",
  "67a7c20a65f763996851514c",
  "685441de72cf3cd5e517c2ce",
  "685441de72cf3cd5e517c2cf",
  "685441de72cf3cd5e517c2d0",
  "685441de72cf3cd5e517c2d1",
];

const gradeValue = {
  A1: 1,
  B2: 2,
  B3: 3,
  C4: 4,
  C5: 5,
  C6: 6,
  D7: 7,
  E8: 8,
  F9: 9,
};
export const generalScienceSubjectId = "685441de72cf3cd5e517c2d1"; // ID for 685441de72cf3cd5e517c2d1 subject

export const getBest6Aggregate = (exams: Array<any>) => {
  if (!exams || exams?.length === 0 || exams?.length < 6) {
    return "***";
  }
  const electives: any[] = [];
  const core: any[] = [];
  exams?.forEach((exam) => {
    // console.log("Exam:", exam);
    if (
      exam.grade?.toLowerCase() !== "ic" &&
      (gradeCoreSubjects.includes(exam.subjectDetails._id) ||
        exam.subjectDetails._id === generalScienceSubjectId)
    ) {
      core.push(exam);
      return;
    }
    if (
      exam?.grade?.toLowerCase() !== "ic" &&
      exam?.subjectDetails.type === "elective"
    ) {
      electives.push(exam);
    }
  });
  // console.log("Core Subjects:", core);
  // console.log("Elective Subjects:", electives);
  // if (core.length < 3) {
  //   return "***";
  // }
  // if (core.length === 4 && electives.length < 2) {
  //   return "***";
  // }

  const isValid =
    (core.length >= 3 && electives.length >= 3) ||
    (core.length === 4 && electives.length === 2);

  if (!isValid) {
    return "**";
  }

  let sortedExams: any[] = [];

  if (electives.length === 2) {
    sortedExams = [...electives, ...core]
      .sort((a: any, b: any) => b.totalScore - a.totalScore)
      .slice(0, 6);
  } else {
    const topElectives = electives
      .sort((a: any, b: any) => b.totalScore - a.totalScore)
      .slice(0, 3);
    const topCore = core
      .sort((a: any, b: any) => b.totalScore - a.totalScore)
      .slice(0, 3);

    sortedExams = [...topElectives, ...topCore];
  }

  let total = 0;
  // console.log("Sorted Exams:", sortedExams);
  for (let i = 0; i < sortedExams.length; i++) {
    const grade = sortedExams[i].grade;
    total += gradeValue[grade as keyof typeof gradeValue] || 0; // Add the grade value based on gradeValue
  }

  return total;
};
