import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import PaymentTransaction from "@/models/PaymentTransaction";
import FridayTestBatch from "@/models/FridayTestBatch";
import { sendSms } from "@/utils/services/sms";
import mongoose, { mongo } from "mongoose";
import { contactNumbers, removePlusSign } from "@/utils/services/utils";
import VotingPaymentTransaction from "@/models/VotingPaymentTransaction";

export const POST = async (request: NextRequest) => {
  const formData = await request.formData();
  const transaction_id = formData.get("transaction_id")?.toString();
  const responseMessage = formData.get("responseMessage")?.toString();
  const status = formData.get("status")?.toString();
  if (!transaction_id) {
    return NextResponse.json(
      { success: false, message: "Transaction ID is required" },
      { status: 200 }
    );
  }

  try {
    await connectDB();
    // Update PaymentTransaction and fetch related data
    const updateFields: any = { responseMessage, status };

    // if (status?.toUpperCase() === "SUCCESS") {
    //   updateFields.$inc = { numberOfTimesUsed: 1 };
    // }

    const updatedTransaction = await VotingPaymentTransaction.findByIdAndUpdate(
      transaction_id,
      updateFields,
      { new: true }
    );
    if (!updatedTransaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 200 }
      );
    }
    // Use aggregation to fetch student and batch details along with the updated transaction
    const result = await VotingPaymentTransaction.aggregate([
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
      return NextResponse.json(
        { success: false, message: "Transaction not found after update" },
        { status: 200 }
      );
    }

    if (updatedTransaction.status.toUpperCase() === "SUCCESS") {
      const { studentInfo, batchInfo, testScores, code, msisdn } = result[0];

      let smsMessage = `${batchInfo?.name} results for ${
        studentInfo?.firstName ? studentInfo?.firstName?.toUpperCase() : ""
      } ${studentInfo?.lastName ? studentInfo?.lastName?.toUpperCase() : ""}\n`;
      smsMessage += "Subject \u00A0|\u00A0 Marks \u00A0|\u00A0 Grade\n";
      for (const score of testScores) {
        smsMessage += `${score.subjectDetails.name.toUpperCase()} \u00A0|\u00A0 ${
          batchInfo?.isSemester ? score.totalScore : score.marks
        } \u00A0|\u00A0 ${score.grade.toUpperCase()}\n`;
      }

      if (batchInfo?.isSemester) {
        smsMessage += `Visit: ${process.env.STUDENT_REPORT_URL}?token=${transaction_id} for more details`;
      }
      await sendSms({
        recipients: [msisdn],
        message: smsMessage,
      });
    }
    return NextResponse.json(
      {
        success: true,
        message: "Transaction updated successfully",
        // transaction: updatedTransaction,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: error?.message || "Error updating transaction" },
      { status: 500 }
    );
  }
};
