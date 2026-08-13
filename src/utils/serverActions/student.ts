"use server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import PaymentTransaction from "@/models/PaymentTransaction";
import { sendSms } from "@/utils/services/sms";
import mongoose from "mongoose";
import { contactNumbers } from "@/utils/services/utils";
import form1List from "@/utils/classList/form1List.json";
import { getCurrentServerUser } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";

// export const getAllStudents = async () => {
//   try {
//     //  await getCurrentServerUser(USER_PERMISSIONS.STUDENT_CREATE)
//     await connectDB();
//     const students = await Student.aggregate([
//       {
//         $lookup: {
//           from: "classes", // Joining Class collection
//           localField: "classId",
//           foreignField: "_id",
//           as: "classInfo",
//         },
//       },
//       { $unwind: "$classInfo" }, // Convert classInfo array into an object
//       {
//         $lookup: {
//           from: "programmes", // Joining Programme collection
//           localField: "classInfo.programme",
//           foreignField: "_id",
//           as: "classInfo.programmeInfo",
//         },
//       },
//       {
//         $unwind: {
//           path: "$classInfo.programmeInfo",
//           preserveNullAndEmptyArrays: true,
//         },
//       }, // Unwind programme data
//       {
//         $addFields: {
//           _id: { $toString: "$_id" }, // Convert _id to string
//           classId: { $toString: "$classId" }, // Convert classId to string
//           studentId: { $toString: "$studentId" }, // Convert studentId to string
//           "classInfo._id": { $toString: "$classInfo._id" }, // Convert classInfo._id to string
//           "classInfo.programme": { $toString: "$classInfo.programme" }, // Convert programme ID to string
//           "classInfo.programmeInfo._id": {
//             $toString: "$classInfo.programmeInfo._id",
//           }, // Convert programmeInfo._id to string
//           createdAt: {
//             $dateToString: {
//               format: "%Y-%m-%dT%H:%M:%S.%LZ",
//               date: "$createdAt",
//             },
//           },
//           updatedAt: {
//             $dateToString: {
//               format: "%Y-%m-%dT%H:%M:%S.%LZ",
//               date: "$updatedAt",
//             },
//           },
//         },
//       },
//       {
//         $sort: { _id: -1 }, // Sort by _id in descending order
//       },
//     ]);

//     if (students.length === 0) {
//       return { success: false, message: "No students found" };
//     }
//     return { success: true, data: students };
//   } catch (err: any) {
//     console.log(err);
//     return { success: false, message: err?.message || "An error occurred" };
//   }
// };


export const getStudentByNumber = async ({
  studentNumber,
  yearGroup,
}: {
  studentNumber: string;
  yearGroup: string;
}) => {
  try {
    await connectDB();
    // const studentNumber = "099";
    // const form = "3";
    // Use aggregation to fetch students by studentNumber and then filter by form
    const students = await Student.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  { $arrayElemAt: [{ $split: ["$studentId", "/"] }, 1] },
                  studentNumber,
                ],
              },
              { $eq: ["$yearGroup", yearGroup] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "classes", // Ensure this matches the actual collection name
          localField: "classId",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      { $unwind: "$classDetails" },
      // {
      //   $match: {
      //     "classDetails.form": form,
      //   },
      // },
    ]);
    if (students.length) {
      return { status: "success", data: students[0] };
    }

    return {
      status: "error",
      message: "No matching student found in the specified form",
    };
  } catch (err: any) {
    console.log(err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const isStudentWithSSIdExists = async (ssId: string) => {
  try {
    await connectDB();
    const student = await Student.findOne({ ssId });
    if (student) {
      return { status: "success", message: "Student with this SS ID exists" };
    }
    return {
      status: "error",
      message: "Student with this SS ID does not exist",
    };
  } catch (err: any) {
    console.log(err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

// add subject to student in a class
export const removeASubjectAndAddAnotherForStudentsInClass = async ({
  classId,
  addSubjectId,
  removeSubjectId,
}: {
  classId: string;
  addSubjectId: string;
  removeSubjectId: string;
}) => {
  try {
    await connectDB();
    // Find all students who classId is equal to the provided classId and remove the removeSubjectId from their subjects array and add the addSubjectId to their subjects array
    // First, remove the subject to be removed
    await Student.updateMany(
      { classId: new mongoose.Types.ObjectId(classId) },
      {
        $pull: { subjects: new mongoose.Types.ObjectId(removeSubjectId) }, // Remove the subject to be removed
      }
    );

    // Then, add the new subject
    const result = await Student.updateMany(
      { classId: new mongoose.Types.ObjectId(classId) },
      {
        $addToSet: { subjects: new mongoose.Types.ObjectId(addSubjectId) }, // Add the new subject if it doesn't already exist
      }
    );

    return {
      success: true,
      message: "Subjects updated successfully",
      data: JSON.parse(JSON.stringify(result)),
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

// add cassRefID to some students using their ssID
export const updateCassRefIDForStudents = async ({
  students
}: {
  students: { ssId: string; cassRefID: string }[];
}) => {
  try {
    await connectDB();
    const bulkOps = students.map((student) => ({
      updateOne: {
        filter: { ssId: student.ssId },
        update: { $set: { cassRefID: student.cassRefID } },
      },
    }));
    const result = await Student.bulkWrite(bulkOps);
    // console.log(JSON.stringify(bulkOps))
    // console.log("length", bulkOps.length)
    return {
      success: true,
      message: "CassRefID updated successfully",
      data: JSON.parse(JSON.stringify(result)),
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


export const getStudentResultsWithPaymentId = async ({
  transaction_id,
  updateNumberOfTimesUsed,
  sessionMsisdn,
}: {
  transaction_id: string;
  updateNumberOfTimesUsed: boolean;
  sessionMsisdn: string; // Add sessionMsisdn
}) => {
  try {
    await connectDB();
    // Update PaymentTransaction and fetch related data

    // Use aggregation to fetch student and batch details along with the updated transaction
    // console.log("transaction_id", transaction_id);
    // console.log("sessionMsisdn", sessionMsisdn);
    const result = await PaymentTransaction.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(transaction_id) } },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo",
        },
      },
      { $unwind: { path: "$studentInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "fridaytestbatches",
          localField: "batchId",
          foreignField: "_id",
          as: "batchInfo",
        },
      },
      { $unwind: { path: "$batchInfo", preserveNullAndEmptyArrays: true } },

      // Filter test scores that match student subjects, batchId, and studentId
      {
        $lookup: {
          from: "fridaytestscores",
          let: {
            studentId: "$studentInfo._id",
            batchId: "$batchInfo._id",
            studentSubjects: "$studentInfo.subjects",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$student", "$$studentId"] },
                    { $eq: ["$fridayTestBatchId", "$$batchId"] },
                    { $in: ["$subject", "$$studentSubjects"] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: "subjects",
                localField: "subject",
                foreignField: "_id",
                as: "subjectDetails",
              },
            },
            {
              $unwind: {
                path: "$subjectDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "testScores",
        },
      },
    ]);

    if (!result.length) {
      return { success: false, message: "Transaction not found" };
    }
    // console.log("result", result)
    const { studentInfo, batchInfo, testScores, code, msisdn } = result[0];

    let smsMessage = `${batchInfo?.name} results for ${studentInfo?.firstName ? studentInfo?.firstName.toUpperCase() : ""
      } ${studentInfo?.lastName ? studentInfo?.lastName.toUpperCase() : ""}\n`;
    smsMessage += "Subject  I  Marks  I  Grade\n";
    for (const score of testScores) {
      smsMessage += `${score.subjectDetails.name.toUpperCase()}  I  ${batchInfo?.isSemester ? score.totalScore : score.marks
        }  I  ${score.grade.toUpperCase()}\n`;
    }
    if (batchInfo?.isSemester) {
      smsMessage += `Visit: ${process.env.NEXT_PUBLIC_STUDENT_REPORT_URL}?token=${transaction_id} for more details`;
    }
    // studentInfo.parentPhoneNumber
    const response = await sendSms({
      recipients: [sessionMsisdn],
      message: smsMessage,
    });
    // console.log("sms response", response);

    if (updateNumberOfTimesUsed) {
      await PaymentTransaction.updateOne(
        { _id: new mongoose.Types.ObjectId(transaction_id) },
        { $inc: { numberOfTimesUsed: 1 } }
      );
    }

    return {
      success: true,
      message: "Transaction updated successfully",
      // transaction: updatedTransaction,
    };
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      error: error?.message || "Error updating transaction",
    };
  }
};

export const getStudentById = async (studentId: string) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.STUDENT_VIEW_DETAILS)
    await connectDB();
    const student = await Student.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      { $unwind: { path: "$classDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "programmes",
          localField: "classDetails.programme",
          foreignField: "_id",
          as: "programmeDetails",
        },
      },
      { $unwind: { path: "$programmeDetails", preserveNullAndEmptyArrays: true } },
    ]);

    if (student.length) {
      return { status: "success", data: JSON.parse(JSON.stringify(student[0])) };
    }
    return { status: "error", message: "Student not found" };
  } catch (err: any) {
    console.log(err);
    return { status: "error", message: err?.message || "An error occurred" };
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
