"use server";
import { connectDB } from "@/lib/mongodb";
import PaymentTransaction from "@/models/PaymentTransaction";
import mongoose from "mongoose";
import { getCurrentServerUser } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";

interface ICheckPayment {
  studentId: string;
  batchId: string;
  examType: string;
  status?: string;
}

export const checkPaymentMadeForStudent = async (data: ICheckPayment) => {
  try {
    await connectDB();
    // const batch = await PaymentTransaction.findOne({
    //   student: new mongoose.Types.ObjectId(data.studentId),
    //   batchId: new mongoose.Types.ObjectId(data.batchId),
    //   examType: data.examType,
    //   status: "success",
    // }).lean();

    const transactions = await PaymentTransaction.find({
      student: new mongoose.Types.ObjectId(data.studentId),
      batchId: new mongoose.Types.ObjectId(data.batchId),
      examType: data.examType,
      status: { $regex: new RegExp("^success$", "i") }, // Case-insensitive match for "success"
    }).lean();

    if (transactions.length > 0) {
      return { success: true, data: JSON.parse(JSON.stringify(transactions[0])) };
    }

    // if (!batch) {
    //   return { success: false, message: "Batch not found" };
    // }
    return { success: false, message: "Batch not found" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


export const getPaymentsByBatchIdAndStudentId = async (data: { studentId: string, batchId: string }) => {
  try {
    await connectDB();
    const batch = await PaymentTransaction.find({
      student: new mongoose.Types.ObjectId(data.studentId),
      batchId: new mongoose.Types.ObjectId(data.batchId)
    }).lean();
    if (!batch) {
      return { success: false, message: "Payment not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(batch)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
export const getAllPaymentTransactions = async () => {
  try {
    await connectDB();

    const transactions = await PaymentTransaction.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "student.classId",
          foreignField: "_id",
          as: "student.class",
        },
      },
      { $unwind: { path: "$student.class", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "fridaytestbatches",
          localField: "batchId",
          foreignField: "_id",
          as: "batch",
        },
      },
      { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },
      {
        $sort: { createdAt: -1 }, // Sort by updatedAt in descending order (most recent first)
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          responseMessage: 1,
          network: 1,
          status: 1,
          examType: 1,
          numberOfTimesUsed: 1,
          msisdn: 1,
          code: 1, // Include other fields from PaymentTransaction if needed
          createdAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" },
          },
          updateAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$updatedAt" },
          },

          student: {
            _id: { $toString: "$student._id" },
            firstName: "$student.firstName",
            lastName: "$student.lastName",
            studentId: "$student.studentId",
            parentPhoneNumber: "$student.parentPhoneNumber",

            class: {
              _id: { $toString: "$student.class._id" },
              name: "$student.class.name",
              form: "$student.class.form",
            },
          },

          batch: {
            _id: { $toString: "$batch._id" },
            name: "$batch.name",
            date: "$batch.date",
          },
        },
      },
    ]);

    return { success: true, data: transactions };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


export const getAllPaymentTransactionsByBatchId = async (batchId: string) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.EXAMS_PAYMENTS_VIEW_ALL)
    await connectDB();

    const transactions = await PaymentTransaction.aggregate([
      {
        $match: { batchId: new mongoose.Types.ObjectId(batchId) }
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "student.classId",
          foreignField: "_id",
          as: "student.class",
        },
      },
      { $unwind: { path: "$student.class", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "fridaytestbatches",
          localField: "batchId",
          foreignField: "_id",
          as: "batch",
        },
      },
      { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },
      {
        $sort: { createdAt: -1 }, // Sort by updatedAt in descending order (most recent first)
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          responseMessage: 1,
          network: 1,
          status: 1,
          examType: 1,
          numberOfTimesUsed: 1,
          msisdn: 1,
          code: 1, // Include other fields from PaymentTransaction if needed
          createdAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" },
          },
          updateAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$updatedAt" },
          },

          student: {
            _id: { $toString: "$student._id" },
            firstName: "$student.firstName",
            lastName: "$student.lastName",
            studentId: "$student.studentId",
            parentPhoneNumber: "$student.parentPhoneNumber",

            class: {
              _id: { $toString: "$student.class._id" },
              name: "$student.class.name",
              form: "$student.class.form",
            },
          },

          batch: {
            _id: { $toString: "$batch._id" },
            name: "$batch.name",
            date: "$batch.date",
          },
        },
      },
    ]);

    return { success: true, data: transactions };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};