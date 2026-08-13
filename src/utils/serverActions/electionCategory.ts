"use server";
import { connectDB } from "@/lib/mongodb";
import ElectionCategory from "@/models/ElectionCategory";
import mongoose from "mongoose";

export const addElectionCategory = async ({
  name,
  electionId,
  shortCode,
}: {
  name: string;
  electionId: string;
  shortCode: string;
}) => {
  try {
    await connectDB();
    const electionCategory = await ElectionCategory.create({
      name: name.toUpperCase(),
      electionId,
      shortCode: shortCode.toUpperCase(),
    });
    return { success: true, message: "Category added successfully" };
  } catch (err: any) {
    console.log("error", err);
    console.log("error", err?.message);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const updateElectionCategory = async ({
  id,
  name,
  shortCode,
}: {
  id: string;
  name: string;
  shortCode: string;
}) => {
  try {
    await connectDB();
    const electionCategory = await ElectionCategory.findByIdAndUpdate(id, {
      name: name.toUpperCase(),
      shortCode: shortCode.toUpperCase(),
    });
    return { success: true, message: "Category updated successfully" };
  } catch (err: any) {
    console.log("error", err);
    console.log("error", err?.message);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getAllElectionCategoriesByAwardId = async ({
  electionId,
}: {
  electionId: string;
}) => {
  try {
    await connectDB();
    const elections = await ElectionCategory.aggregate([
      {
        $match: {
          electionId: new mongoose.Types.ObjectId(electionId),
          isDeleted: false,
          isSuspended: false,
        },
      },
      {
        $lookup: {
          from: "votingpaymenttransactions",
          let: { categoryId: "$_id" },
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
            {
              $group: {
                _id: null,
                totalVotes: { $sum: "$numberOfVotes" },
              },
            },
          ],
          as: "voteInfo",
        },
      },
      {
        $addFields: {
          totalVotes: {
            $ifNull: [{ $arrayElemAt: ["$voteInfo.totalVotes", 0] }, 0],
          },
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          name: 1,
          shortCode: 1,
          totalVotes: 1,
        },
      },
      {
        $sort: { totalVotes: -1 },
      },
    ]);
    // console.log("elections", elections);
    return { success: true, data: JSON.parse(JSON.stringify(elections)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getElectionCategoryById = async ({ id }: { id: string }) => {
  try {
    await connectDB();
    const electionCategory = await ElectionCategory.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          isDeleted: false,
          isSuspended: false,
        },
      },
      {
        $lookup: {
          from: "electionnominees",
          localField: "_id",
          foreignField: "categoryId",
          as: "nominees",
        },
      },
      {
        $unwind: {
          path: "$nominees",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "electionusers",
          let: { nomineeId: "$nominees.nomineeId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$nomineeId"] } } },
            { $project: { password: 0 } },
          ],
          as: "nominees.nomineeDetails",
        },
      },
      {
        $lookup: {
          from: "votingpaymenttransactions",
          let: {
            categoryId: new mongoose.Types.ObjectId(id),
            nomineeId: "$nominees.nomineeId",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$categoryId", "$$categoryId"] },
                    { $eq: ["$nomineeId", "$$nomineeId"] },
                    { $eq: [{ $toLower: "$status" }, "success"] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalVotes: { $sum: "$numberOfVotes" },
              },
            },
          ],
          as: "nominees.voteInfo",
        },
      },
      {
        $unwind: {
          path: "$nominees.nomineeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "nominees.numberOfVotes": {
            $ifNull: [
              { $arrayElemAt: ["$nominees.voteInfo.totalVotes", 0] },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          shortCode: { $first: "$shortCode" },
          nominees: {
            $push: {
              _id: "$nominees._id",
              nomineeId: "$nominees.nomineeId",
              numberOfVotes: "$nominees.numberOfVotes",
              nomineeCode: "$nominees.nomineeCode",
              nomineeDetails: "$nominees.nomineeDetails",
            },
          },
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          name: 1,
          shortCode: 1,
          nominees: {
            $sortArray: {
              input: "$nominees",
              sortBy: { numberOfVotes: -1 },
            },
          },
        },
      },
    ]);
    if (!electionCategory)
      return { success: false, message: "Category not found" };
    return {
      success: true,
      data: JSON.parse(JSON.stringify(electionCategory)),
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
