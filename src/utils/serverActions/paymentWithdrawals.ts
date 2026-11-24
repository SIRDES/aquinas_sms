"use server";
import { connectDB } from "@/lib/mongodb";
import PaymentTransaction from "@/models/PaymentTransaction";
import mongoose from "mongoose";
import { getCurrentServerUser } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";
import PaymentWithdrawals from "@/models/PaymentWithdrawals";

// search payment transactions
// export const searchPaymentTransactionsForWithdrawal = async (searchTerm: string) => {
//   try {
//     await getCurrentServerUser(USER_PERMISSIONS.EXAMS_PAYMENTS_VIEW_ALL);
//     await connectDB();

//     const term = (searchTerm || "").trim();
//     const matchStage: any = {
//       isDeleted: { $ne: true },
//     };

//     const pipeline: any[] = [
//       {
//         $lookup: {
//           from: "students",
//           localField: "student",
//           foreignField: "_id",
//           as: "student",
//         },
//       },
//       { $unwind: { path: "$student", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "classes",
//           localField: "student.classId",
//           foreignField: "_id",
//           as: "student.class",
//         },
//       },
//       { $unwind: { path: "$student.class", preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: "fridaytestbatches",
//           localField: "batchId",
//           foreignField: "_id",
//           as: "batch",
//         },
//       },
//       { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },
//     ];

//     if (term) {
//       const regex = new RegExp(term, "i");
//       pipeline.push({
//         $match: {
//           $or: [
//             // { code: { $regex: regex } },
//             { msisdn: { $regex: regex } },
//             { "student.studentId": { $regex: regex } },
//             { "student.firstName": { $regex: regex } },
//             { "student.lastName": { $regex: regex } },
//             {
//               $expr: {
//                 $regexMatch: {
//                   input: {
//                     $concat: [
//                       { $ifNull: ["$student.firstName", ""] },
//                       " ",
//                       { $ifNull: ["$student.lastName", ""] },
//                     ],
//                   },
//                   regex: term,
//                   options: "i",
//                 },
//               },
//             },
//           ],
//         },
//       });
//     }

//     pipeline.push(
//       { $sort: { createdAt: -1 } },
//       { $limit: 20 },
//       {
//         $project: {
//           _id: { $toString: "$_id" },
//           code: 1,
//           status: 1,
//           amount: 1,
//           msisdn: 1,
//           network: 1,
//           createdAt: {
//             $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" },
//           },
//           student: {
//             _id: { $toString: "$student._id" },
//             firstName: "$student.firstName",
//             lastName: "$student.lastName",
//             studentId: "$student.studentId",
//             class: {
//               name: "$student.class.name",
//               form: "$student.class.form",
//             },
//           },
//           batch: {
//             _id: { $toString: "$batch._id" },
//             name: "$batch.name",
//           },
//         },
//       }
//     );

//     const results = await PaymentTransaction.aggregate(pipeline);
//     return { success: true, data: results };
//   } catch (err: any) {
//     console.log(err);
//     return { success: false, message: err?.message || "An error occurred", data: [] };
//   }
// };

// add new paymentWithdrawal
export const addNewPaymentWithdrawal = async (data: {
  status: string;
  lastPaymentTransaction: string;
  firstPaymentTransaction: string;
}) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.PAYMENTS_WITHDRAWALS_MAKE_WITHDRAWAL);
    await connectDB();

    const { status, lastPaymentTransaction, firstPaymentTransaction } = data;

    if (!status || !lastPaymentTransaction || !firstPaymentTransaction) {
      return {
        success: false,
        message: "Status, first payment transaction, and last payment transaction are required",
      };
    }

    const newWithdrawal = await PaymentWithdrawals.create({
      status,
      lastPaymentTransaction: new mongoose.Types.ObjectId(lastPaymentTransaction),
      firstPaymentTransaction: new mongoose.Types.ObjectId(firstPaymentTransaction),
    });

    return {
      success: true,
      message: "Payment withdrawal added successfully",
      data: JSON.parse(JSON.stringify(newWithdrawal)),
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getAllPaymentWithdrawals = async () => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.PAYMENTS_WITHDRAWALS_VIEW_ALL)
    await connectDB();

    const transactions = await PaymentWithdrawals.aggregate([
      {
        $lookup: {
          from: "paymenttransactions",
          localField: "lastPaymentTransaction",
          foreignField: "_id",
          as: "lastPaymentTransaction",
        },
      },
      { $unwind: { path: "$lastPaymentTransaction", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "students",
          localField: "lastPaymentTransaction.student",
          foreignField: "_id",
          as: "lastPaymentTransaction.student",
        },
      },
      { $unwind: { path: "$lastPaymentTransaction.student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "lastPaymentTransaction.student.classId",
          foreignField: "_id",
          as: "lastPaymentTransaction.student.class",
        },
      },
      { $unwind: { path: "$lastPaymentTransaction.student.class", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "fridaytestbatches",
          localField: "lastPaymentTransaction.batchId",
          foreignField: "_id",
          as: "lastPaymentTransaction.batch",
        },
      },
      { $unwind: { path: "$lastPaymentTransaction.batch", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "paymenttransactions",
          localField: "firstPaymentTransaction",
          foreignField: "_id",
          as: "firstPaymentTransaction",
        },
      },
      { $unwind: { path: "$firstPaymentTransaction", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "students",
          localField: "firstPaymentTransaction.student",
          foreignField: "_id",
          as: "firstPaymentTransaction.student",
        },
      },
      { $unwind: { path: "$firstPaymentTransaction.student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "firstPaymentTransaction.student.classId",
          foreignField: "_id",
          as: "firstPaymentTransaction.student.class",
        },
      },
      { $unwind: { path: "$firstPaymentTransaction.student.class", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "fridaytestbatches",
          localField: "firstPaymentTransaction.batchId",
          foreignField: "_id",
          as: "firstPaymentTransaction.batch",
        },
      },
      { $unwind: { path: "$firstPaymentTransaction.batch", preserveNullAndEmptyArrays: true } },
      {
        $sort: { createdAt: -1 }, // Sort by updatedAt in descending order (most recent first)
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          status: 1,
          createdAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" },
          },
          updateAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$updatedAt" },
          },

          lastPaymentTransaction: {
            _id: { $toString: "$lastPaymentTransaction._id" },
            responseMessage: "$lastPaymentTransaction.responseMessage",
            network: "$lastPaymentTransaction.network",
            status: "$lastPaymentTransaction.status",
            examType: "$lastPaymentTransaction.examType",
            numberOfTimesUsed: "$lastPaymentTransaction.numberOfTimesUsed",
            msisdn: "$lastPaymentTransaction.msisdn",
            amount: "$lastPaymentTransaction.amount",
            code: "$lastPaymentTransaction.code",
            createdAt: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$lastPaymentTransaction.createdAt" },
            },
            updateAt: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$lastPaymentTransaction.updatedAt" },
            },
            student: {
              _id: { $toString: "$lastPaymentTransaction.student._id" },
              firstName: "$lastPaymentTransaction.student.firstName",
              lastName: "$lastPaymentTransaction.student.lastName",
              studentId: "$lastPaymentTransaction.student.studentId",
              parentPhoneNumber: "$lastPaymentTransaction.student.parentPhoneNumber",
              class: {
                _id: { $toString: "$lastPaymentTransaction.student.class._id" },
                name: "$lastPaymentTransaction.student.class.name",
                form: "$lastPaymentTransaction.student.class.form",
              },
            },
            batch: {
              _id: { $toString: "$lastPaymentTransaction.batch._id" },
              name: "$lastPaymentTransaction.batch.name",
              date: "$lastPaymentTransaction.batch.date",
            },
          },

          firstPaymentTransaction: {
            _id: { $toString: "$firstPaymentTransaction._id" },
            responseMessage: "$firstPaymentTransaction.responseMessage",
            network: "$firstPaymentTransaction.network",
            status: "$firstPaymentTransaction.status",
            examType: "$firstPaymentTransaction.examType",
            numberOfTimesUsed: "$firstPaymentTransaction.numberOfTimesUsed",
            msisdn: "$firstPaymentTransaction.msisdn",
            amount: "$firstPaymentTransaction.amount",
            code: "$firstPaymentTransaction.code",
            createdAt: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$firstPaymentTransaction.createdAt" },
            },
            updateAt: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$firstPaymentTransaction.updatedAt" },
            },
            student: {
              _id: { $toString: "$firstPaymentTransaction.student._id" },
              firstName: "$firstPaymentTransaction.student.firstName",
              lastName: "$firstPaymentTransaction.student.lastName",
              studentId: "$firstPaymentTransaction.student.studentId",
              parentPhoneNumber: "$firstPaymentTransaction.student.parentPhoneNumber",
              class: {
                _id: { $toString: "$firstPaymentTransaction.student.class._id" },
                name: "$firstPaymentTransaction.student.class.name",
                form: "$firstPaymentTransaction.student.class.form",
              },
            },
            batch: {
              _id: { $toString: "$firstPaymentTransaction.batch._id" },
              name: "$firstPaymentTransaction.batch.name",
              date: "$firstPaymentTransaction.batch.date",
            },
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


// get payment withdrawals by id
export const getPaymentWithdrawalsById = async (id: string) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.PAYMENTS_WITHDRAWALS_VIEW_ALL);
    await connectDB();

    const withdrawalObjectId = new mongoose.Types.ObjectId(id);

    const withdrawalData = await PaymentWithdrawals.aggregate([
      {
        $match: { _id: withdrawalObjectId },
      },
      // Lookup the firstPaymentTransaction document to get its createdAt & details
      {
        $lookup: {
          from: "paymenttransactions",
          localField: "firstPaymentTransaction",
          foreignField: "_id",
          as: "firstPaymentTransactionDoc",
        },
      },
      { $unwind: { path: "$firstPaymentTransactionDoc", preserveNullAndEmptyArrays: true } },
      // Lookup the lastPaymentTransaction document to get its createdAt & details
      {
        $lookup: {
          from: "paymenttransactions",
          localField: "lastPaymentTransaction",
          foreignField: "_id",
          as: "lastPaymentTransactionDoc",
        },
      },
      { $unwind: { path: "$lastPaymentTransactionDoc", preserveNullAndEmptyArrays: true } },
      // Determine the min and max _id between first and last transactions
      {
        $addFields: {
          minId: {
            $cond: [
              { $lt: ["$firstPaymentTransaction", "$lastPaymentTransaction"] },
              "$firstPaymentTransaction",
              "$lastPaymentTransaction",
            ],
          },
          maxId: {
            $cond: [
              { $gt: ["$firstPaymentTransaction", "$lastPaymentTransaction"] },
              "$firstPaymentTransaction",
              "$lastPaymentTransaction",
            ],
          },
        },
      },
      // Lookup all paymenttransactions between first and last _id (inclusive)
      {
        $lookup: {
          from: "paymenttransactions",
          let: {
            minId: "$minId",
            maxId: "$maxId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $gte: ["$_id", "$$minId"] },
                    { $lte: ["$_id", "$$maxId"] },
                    { $ne: ["$isDeleted", true] },
                    { $eq: [{ $toLower: { $ifNull: ["$status", ""] } }, "success"] },
                  ],
                },
              },
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
              $lookup: {
                from: "academicyears",
                localField: "batch.academicYear",
                foreignField: "_id",
                as: "batch.academicYearDetails",
              },
            },
            {
              $unwind: {
                path: "$batch.academicYearDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $project: {
                _id: { $toString: "$_id" },
                batchId: { $toString: "$batchId" },
                // code: 1,
                amount: 1,
                status: 1,
                responseMessage: 1,
                examType: 1,
                // numberOfTimesUsed: 1,
                network: 1,
                msisdn: 1,

                createdAt: {
                  $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" },
                },
                updatedAt: {
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
                  createdAt: "$batch.createdAt",
                  updatedAt: "$batch.updatedAt",
                  yearGroup: "$batch.yearGroup",
                  academicYear: { $toString: "$batch.academicYear" },
                  academicYearDetails: {
                    _id: { $toString: "$batch.academicYearDetails._id" },
                    name: "$batch.academicYearDetails.name",
                  },
                },
              },
            },
            {
              $group: {
                _id: "$batchId",
                batchId: { $first: "$batchId" },
                batch: { $first: "$batch" },
                totalAmount: {
                  $sum: { $toDouble: { $ifNull: ["$amount", "0"] } },
                },
                count: { $sum: 1 },
                transactions: { $push: "$$ROOT" },
              },
            },
            {
              $sort: { "batch.createdAt": -1 },
            },
          ],
          as: "paymentTransactions",
        },
      },
      // Calculate totalWithdrawalAmount from paymentTransactions totalAmounts
      {
        $addFields: {
          totalWithdrawalAmount: {
            $sum: {
              $map: {
                input: "$paymentTransactions",
                as: "group",
                in: { $toDouble: { $ifNull: ["$$group.totalAmount", 0] } },
              },
            },
          },
        },
      },
      // Populate student & batch details for firstPaymentTransactionDoc
      {
        $lookup: {
          from: "students",
          localField: "firstPaymentTransactionDoc.student",
          foreignField: "_id",
          as: "firstPaymentTransactionDoc.student",
        },
      },
      { $unwind: { path: "$firstPaymentTransactionDoc.student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "firstPaymentTransactionDoc.student.classId",
          foreignField: "_id",
          as: "firstPaymentTransactionDoc.student.class",
        },
      },
      { $unwind: { path: "$firstPaymentTransactionDoc.student.class", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "fridaytestbatches",
          localField: "firstPaymentTransactionDoc.batchId",
          foreignField: "_id",
          as: "firstPaymentTransactionDoc.batch",
        },
      },
      { $unwind: { path: "$firstPaymentTransactionDoc.batch", preserveNullAndEmptyArrays: true } },
      // Populate student & batch details for lastPaymentTransactionDoc
      {
        $lookup: {
          from: "students",
          localField: "lastPaymentTransactionDoc.student",
          foreignField: "_id",
          as: "lastPaymentTransactionDoc.student",
        },
      },
      { $unwind: { path: "$lastPaymentTransactionDoc.student", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "classes",
          localField: "lastPaymentTransactionDoc.student.classId",
          foreignField: "_id",
          as: "lastPaymentTransactionDoc.student.class",
        },
      },
      { $unwind: { path: "$lastPaymentTransactionDoc.student.class", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "fridaytestbatches",
          localField: "lastPaymentTransactionDoc.batchId",
          foreignField: "_id",
          as: "lastPaymentTransactionDoc.batch",
        },
      },
      { $unwind: { path: "$lastPaymentTransactionDoc.batch", preserveNullAndEmptyArrays: true } },
      // Project the final response shape
      {
        $project: {
          _id: { $toString: "$_id" },
          status: 1,
          totalWithdrawalAmount: 1,
          createdAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" },
          },
          updatedAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$updatedAt" },
          },
          firstPaymentTransaction: {
            _id: { $toString: "$firstPaymentTransactionDoc._id" },
            code: "$firstPaymentTransactionDoc.code",
            status: "$firstPaymentTransactionDoc.status",
            responseMessage: "$firstPaymentTransactionDoc.responseMessage",
            examType: "$firstPaymentTransactionDoc.examType",
            numberOfTimesUsed: "$firstPaymentTransactionDoc.numberOfTimesUsed",
            network: "$firstPaymentTransactionDoc.network",
            msisdn: "$firstPaymentTransactionDoc.msisdn",
            amount: "$firstPaymentTransactionDoc.amount",
            createdAt: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$firstPaymentTransactionDoc.createdAt" },
            },
            updatedAt: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$firstPaymentTransactionDoc.updatedAt" },
            },
            student: {
              _id: { $toString: "$firstPaymentTransactionDoc.student._id" },
              firstName: "$firstPaymentTransactionDoc.student.firstName",
              lastName: "$firstPaymentTransactionDoc.student.lastName",
              studentId: "$firstPaymentTransactionDoc.student.studentId",
              parentPhoneNumber: "$firstPaymentTransactionDoc.student.parentPhoneNumber",
              class: {
                _id: { $toString: "$firstPaymentTransactionDoc.student.class._id" },
                name: "$firstPaymentTransactionDoc.student.class.name",
                form: "$firstPaymentTransactionDoc.student.class.form",
              },
            },
            batch: {
              _id: { $toString: "$firstPaymentTransactionDoc.batch._id" },
              name: "$firstPaymentTransactionDoc.batch.name",
              date: "$firstPaymentTransactionDoc.batch.date",
            },
          },
          lastPaymentTransaction: {
            _id: { $toString: "$lastPaymentTransactionDoc._id" },
            code: "$lastPaymentTransactionDoc.code",
            status: "$lastPaymentTransactionDoc.status",
            responseMessage: "$lastPaymentTransactionDoc.responseMessage",
            examType: "$lastPaymentTransactionDoc.examType",
            numberOfTimesUsed: "$lastPaymentTransactionDoc.numberOfTimesUsed",
            network: "$lastPaymentTransactionDoc.network",
            msisdn: "$lastPaymentTransactionDoc.msisdn",
            amount: "$lastPaymentTransactionDoc.amount",
            createdAt: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$lastPaymentTransactionDoc.createdAt" },
            },
            updatedAt: {
              $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$lastPaymentTransactionDoc.updatedAt" },
            },
            student: {
              _id: { $toString: "$lastPaymentTransactionDoc.student._id" },
              firstName: "$lastPaymentTransactionDoc.student.firstName",
              lastName: "$lastPaymentTransactionDoc.student.lastName",
              studentId: "$lastPaymentTransactionDoc.student.studentId",
              parentPhoneNumber: "$lastPaymentTransactionDoc.student.parentPhoneNumber",
              class: {
                _id: { $toString: "$lastPaymentTransactionDoc.student.class._id" },
                name: "$lastPaymentTransactionDoc.student.class.name",
                form: "$lastPaymentTransactionDoc.student.class.form",
              },
            },
            batch: {
              _id: { $toString: "$lastPaymentTransactionDoc.batch._id" },
              name: "$lastPaymentTransactionDoc.batch.name",
              date: "$lastPaymentTransactionDoc.batch.date",
            },
          },
          paymentTransactions: 1,
        },
      },
    ]);

    if (!withdrawalData || withdrawalData.length === 0) {
      return { success: false, message: "Payment withdrawal not found" };
    }

    return { success: true, data: withdrawalData[0] };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};