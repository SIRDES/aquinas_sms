import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import PaymentTransaction from "@/models/PaymentTransaction";
import FridayTestBatch from "@/models/FridayTestBatch";
import { sendSms } from "@/utils/services/sms";
import mongoose, { mongo } from "mongoose";
import { contactNumbers, removePlusSign } from "@/utils/services/utils";

export const POST = async (request: NextRequest) => {
  // 1. Log the raw headers for debugging
  console.log(
    "Incoming headers>>>>>>>>>>>>>>>>>>>>>>>>>>:",
    Object.fromEntries(request.headers.entries())
  );

  // 2. Get the content type and log it
  const contentType = request.headers.get("content-type") || "";
  console.log("Content-Type>>>>>>>>>>>>>>>:", contentType);

  const jsonBody = await request.json();
  console.log("JSON Body>>>>>>>>>>>>>>>>>>>>>>>>>>:", jsonBody);

  // const formData = await request.formData();
  // const transaction_id = formData.get("transaction_id")?.toString();
  // const responseMessage = formData.get("responseMessage")?.toString();
  // const status = formData.get("status")?.toString();
  const transaction_id = jsonBody.transaction_id;
  const responseMessage = jsonBody.responseMessage;
  const status = jsonBody.status;

  if (!transaction_id) {
    return NextResponse.json(
      { success: false, message: "Transaction ID is required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    // Update PaymentTransaction and fetch related data
    const updateFields: any = { responseMessage, status };

    if (status?.toUpperCase() === "SUCCESS") {
      updateFields.$inc = { numberOfTimesUsed: 1 };
    }

    const updatedTransaction = await PaymentTransaction.findByIdAndUpdate(
      transaction_id,
      updateFields,
      { new: true }
    );
    if (!updatedTransaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404 }
      );
    }
    // Use aggregation to fetch student and batch details along with the updated transaction
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
      return NextResponse.json(
        { success: false, message: "Transaction not found after update" },
        { status: 404 }
      );
    }

    if (updatedTransaction.status.toUpperCase() === "SUCCESS") {
      const { studentInfo, batchInfo, testScores, code, msisdn } = result[0];
      // \u00A0|\u00A0
      let smsMessage = `${batchInfo?.name} results for ${
        studentInfo?.firstName ? studentInfo?.firstName?.toUpperCase() : ""
      } ${studentInfo?.lastName ? studentInfo?.lastName?.toUpperCase() : ""}\n`;
      smsMessage += "Subject  I  Marks  I  Grade\n";
      for (const score of testScores) {
        smsMessage += `${score.subjectDetails.name.toUpperCase()}. I  ${
          batchInfo?.isSemester ? score.totalScore : score.marks
        }  I  ${score.grade.toUpperCase()}\n`;
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
