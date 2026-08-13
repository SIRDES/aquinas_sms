"use server";
import { connectDB } from "@/lib/mongodb";
import ElectionCategory from "@/models/ElectionCategory";
import ElectionNominee from "@/models/ElectionNominee";
import mongoose from "mongoose";

export const addElectionNominee = async ({
  nomineeId,
  electionId,
  categoryId,
}: {
  nomineeId: string;
  electionId: string;
  categoryId: string;
}) => {
  try {
    await connectDB();
    // Find the last nominee for this election, sorted by nomineeCode descending
    const lastNominee = await ElectionNominee.findOne({ electionId })
      .sort({ nomineeCode: -1 })
      .lean();

    let shortCode: string;
    if (lastNominee && lastNominee.nomineeCode) {
      // Extract the numeric part after 'AQE'
      const match = lastNominee.nomineeCode.match(/^AQA(\d+)$/);
      const lastCodeNum = match ? parseInt(match[1], 10) : 1;
      const nextCodeNum = lastCodeNum + 1;
      shortCode = `AQA${nextCodeNum.toString().padStart(2, "0")}`;
    } else {
      shortCode = "AQA01";
    }
    const election = await ElectionNominee.create({
      nomineeId,
      categoryId,
      electionId,
      nomineeCode: shortCode.toUpperCase(),
    });
    return { success: true, message: "Nominee added successfully" };
  } catch (err: any) {
    console.log("error", err);
    console.log("error", err?.message);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
export const getAllElectionNomineesByElectionId = async ({
  electionId,
}: {
  electionId: string;
}) => {
  try {
    await connectDB();

    // each electionNominee has nomineeId and categoryId
    const elections = await ElectionNominee.aggregate([
      {
        $match: {
          electionId: new mongoose.Types.ObjectId(electionId),
          isDeleted: false,
          isSuspended: false,
        },
      },
      {
        $lookup: {
          from: "electionusers",
          localField: "nomineeId",
          foreignField: "_id",
          as: "nominee",
        },
      },
      {
        $unwind: "$nominee",
      },
      {
        $project: {
          // Exclude password field from nominee
          "nominee.password": 0,
        },
      },
      {
        $lookup: {
          from: "electioncategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $addFields: {
          categoryName: { $toLower: "$category.name" },
        },
      },
      {
        $sort: { categoryName: 1 },
      },
    ]);
    console.log("elections nominees", elections);
    if (!elections) return { success: false, message: "Nominees not found" };
    if (!elections.length)
      return { success: false, message: "No Nominees not found" };
    return { success: true, data: JSON.parse(JSON.stringify(elections)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
export const getAllElectionNomineeByElectionIdAndNomineeCode = async ({
  electionId,
  nomineeCode,
}: {
  electionId: string;
  nomineeCode: string;
}) => {
  try {
    await connectDB();

    // each electionNominee has nomineeId and categoryId
    const elections = await ElectionNominee.aggregate([
      {
        $match: {
          electionId: new mongoose.Types.ObjectId(electionId),
          isDeleted: false,
          isSuspended: false,
          nomineeCode: nomineeCode?.toUpperCase(),
        },
      },
      {
        $lookup: {
          from: "electionusers",
          localField: "nomineeId",
          foreignField: "_id",
          as: "nominee",
        },
      },
      {
        $unwind: "$nominee",
      },
      {
        $project: {
          // Exclude password field from nominee
          "nominee.password": 0,
        },
      },
      {
        $lookup: {
          from: "electioncategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $addFields: {
          categoryName: { $toLower: "$category.name" },
        },
      },
      {
        $sort: { categoryName: 1 },
      },
    ]);
    // console.log("elections nominees", elections);
    if (!elections) return { success: false, message: "Nominee not found" };
    if (!elections.length)
      return { success: false, message: "No Nominee found" };
    return { success: true, data: JSON.parse(JSON.stringify(elections[0])) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const deleteElectionNominee = async ({ id }: { id: string }) => {
  try {
    await connectDB();
    const deletedNominee = await ElectionNominee.findByIdAndDelete(id);
    if (!deletedNominee) {
      return { success: false, message: "Nominee not found" };
    }
    return { success: true, message: "Nominee deleted successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getNominationsByNomineeId = async ({ id }: { id: string }) => {
  try {
    await connectDB();
    const nominations = await ElectionNominee.aggregate([
      {
        $match: {
          nomineeId: new mongoose.Types.ObjectId(id),
          isDeleted: false,
          isSuspended: false,
        },
      },
      {
        $lookup: {
          from: "electioncategories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $lookup: {
          from: "votingpaymenttransactions",
          let: {
            categoryId: "$category._id",
            nomineeId: "$nomineeId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$categoryId", "$$categoryId"] },
                    { $eq: [{ $toLower: "$status" }, "success"] },
                  ],
                },
              },
            },
          ],
          as: "votingTransactions",
        },
      },
      {
        $addFields: {
          categoryName: { $toLower: "$category.name" },
          totalVotes: {
            $sum: "$votingTransactions.numberOfVotes",
          },
          numberOfVotes: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$votingTransactions",
                    as: "vt",
                    cond: { $eq: ["$$vt.nomineeId", "$nomineeId"] },
                  },
                },
                as: "filtered",
                in: "$$filtered.numberOfVotes",
              },
            },
          },
        },
      },
      {
        $project: {
          votingTransactions: 0,
        },
      },
      {
        $sort: { numberOfVotes: -1 },
      },
    ]);
    // console.log("elections nominees", nominations);
    if (!nominations) return { success: false, message: "Nominees not found" };
    if (!nominations.length)
      return { success: false, message: "No Nominees not found" };
    return { success: true, data: JSON.parse(JSON.stringify(nominations)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
