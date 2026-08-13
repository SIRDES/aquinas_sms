"use server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Class from "@/models/Class";
import Subject from "@/models/Subject";
import PaymentTransaction from "@/models/PaymentTransaction";
import { sendSms } from "@/utils/services/sms";
import mongoose from "mongoose";
import { contactNumbers } from "@/utils/services/utils";
import form1List from "@/utils/classList/form1List.json";
import { getCurrentServerUser } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";

// get number of students in form 1, 2, and 3. return NumOfForm1Student, NumOfForm2Student, NumOfForm3Student, and total number of students
export const getNumberOfStudent = async () => {
  try {
    await connectDB();

    // Fetch all classes that are not deleted
    const classes = await Class.find({ isDeleted: { $ne: true } }).select("_id form");
    const form1ClassIds = classes.filter((c) => c.form === "1").map((c) => c._id);
    const form2ClassIds = classes.filter((c) => c.form === "2").map((c) => c._id);
    const form3ClassIds = classes.filter((c) => c.form === "3").map((c) => c._id);

    const [numOfForm1Student, numOfForm2Student, numOfForm3Student] = await Promise.all([
      Student.countDocuments({
        classId: { $in: form1ClassIds },
        isDeleted: { $ne: true },
      }),
      Student.countDocuments({
        classId: { $in: form2ClassIds },
        isDeleted: { $ne: true },
      }),
      Student.countDocuments({
        classId: { $in: form3ClassIds },
        isDeleted: { $ne: true },
      }),
    ]);
    const totalNumberOfStudents = numOfForm1Student + numOfForm2Student + numOfForm3Student;

    return {
      success: true,
      data: {
        numOfForm1Student,
        numOfForm2Student,
        numOfForm3Student,
        totalNumberOfStudents,
      },
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


// get the number of students in a form like form 1, or 2 or 3,whose does each subject have less than 50% of the students. return the subjects and the number of students who offer that subject.
export const getNumberOfStudentBySubject = async (form: string) => {
  try {
    await connectDB();
    const classes = await Class.find({ form, isDeleted: { $ne: true } }).select("_id");
    const classIds = classes.map((c) => c._id);

    const subjectCountsList = await Student.aggregate([
      {
        $match: {
          classId: { $in: classIds },
          isDeleted: { $ne: true },
        },
      },
      {
        $unwind: "$subjects",
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subjects",
          foreignField: "_id",
          as: "subjectDetails",
        },
      },
      {
        $unwind: "$subjectDetails",
      },
      {
        $group: {
          _id: "$subjectDetails._id",
          name: { $first: "$subjectDetails.name" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          name: 1,
        },
      },
    ])


    const filteredSubjectCounts: Array<{ name: string; numberOfStudents: number }> = [];
    subjectCountsList.forEach((item) => {
      if (item._id) {
        filteredSubjectCounts.push({
          name: item.name,
          numberOfStudents: item.count,
        });
      }
    });

    filteredSubjectCounts.sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      data: filteredSubjectCounts,
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

// write a function to convert all subject names to uppercase

export const convertAllSubjectNamesToUppercase = async () => {
  try {
    await connectDB();
    const subjects = await Subject.find({}).select("_id name");
    const bulkOps = subjects.map((subject: any) => ({
      updateOne: {
        filter: { _id: subject._id },
        update: {
          $set: {
            name: subject.name.toUpperCase(),
          },
        },
      },
    }));
    const result = await Subject.bulkWrite(bulkOps);
    return {
      success: true,
      message: "All subject names converted to uppercase successfully",
      data: JSON.parse(JSON.stringify(result)),
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


// export const updateParentPhoneNumbers = async () => {
//   try {
//     await connectDB();
//     const bulkOps = form1List.map((student: any) => ({
//       updateOne: {
//         filter: { cassRefID: student.CassRefID },
//         update: {
//           $set: {
//             parentPhoneNumber: student.parentPhoneNumber === "N/A" ? "" : `+233${student.parentPhoneNumber.substring(1)}`
//           }
//         },
//       },
//     }));

//     const result = await Student.bulkWrite(bulkOps);

//     return {
//       success: true,
//       message: "Parent phone numbers updated successfully",
//       data: JSON.parse(JSON.stringify(result)),
//     };
//   } catch (err: any) {
//     console.log(err);
//     return { success: false, message: err?.message || "An error occurred" };
//   }
// };
