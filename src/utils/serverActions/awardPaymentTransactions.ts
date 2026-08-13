"use server";
import { connectDB } from "@/lib/mongodb";
import VotingPaymentTransaction from "@/models/VotingPaymentTransaction";
import mongoose from "mongoose";

export const getAllAwardPaymentTransactionsByElectionId = async (
  electionId: string
) => {
  try {
    await connectDB();

    const transactions = await VotingPaymentTransaction.aggregate([
      {
        $match: { electionId: new mongoose.Types.ObjectId(electionId) },
      },
      {
        $lookup: {
          from: "electionusers",
          localField: "nomineeId",
          foreignField: "_id",
          as: "nominee",
        },
      },
      { $unwind: { path: "$nominee", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "electioncategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $sort: { createdAt: -1 }, // Sort by updatedAt in descending order (most recent first)
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          numberOfVotes: 1,
          responseMessage: 1,
          status: 1,
          electionId: 1,
          nomineeId: 1,
          nomineeCode: 1,
          categoryId: 1,
          amount: 1,
          msisdn: 1,
          network: 1, // Include other fields from PaymentTransaction if needed
          createdAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" },
          },
          updateAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$updatedAt" },
          },

          nominee: {
            _id: { $toString: "$nominee._id" },
            firstName: "$nominee.firstName",
            lastName: "$nominee.lastName",
            aliasName: "$nominee.aliasName",
            parentPhoneNumber: "$nominee.parentPhoneNumber",
          },
          category: {
            _id: { $toString: "$category._id" },
            name: "$category.name",
            shortCode: "$category.shortCode",
          },
        },
      },
    ]);

    return { success: true, data: JSON.parse(JSON.stringify(transactions)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
