"use server";
import { connectDB } from "@/lib/mongodb";
import ElectionUser from "@/models/ElectionUser";
import mongoose from "mongoose";

export const getAllElectionUsers = async (electionId: string) => {
  try {
    await connectDB();
    const usersWithSubjects = await ElectionUser.find({ electionId }).select(
      "-password"
    );
    if (!usersWithSubjects)
      return { success: false, message: "No Award User found" };
    return {
      success: true,
      data: JSON.parse(JSON.stringify(usersWithSubjects)),
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const addElectionUser = async (data: {
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber: string;
  email: string;
  aliasName?: string;
  electionId: string;
}) => {
  const {
    firstName,
    lastName,
    role,
    phoneNumber,
    email,
    aliasName,
    electionId,
  } = data;
  try {
    await connectDB();
    const result = await ElectionUser.create({
      firstName,
      lastName,
      aliasName,
      electionId,
      email: email?.toLowerCase(),
      password: process.env.NEXT_PUBLIC_NEW_ELECTION_USER_PASSWORD,
      role,
      phoneNumber,
    });
    // console.log("subjects", subjects);
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const updateElectionUser = async (data: {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber: string;
  email: string;
  aliasName?: string;
}) => {
  const { id, firstName, lastName, role, phoneNumber, email, aliasName } = data;
  try {
    await connectDB();
    const result = await ElectionUser.findByIdAndUpdate(id, {
      firstName,
      lastName,
      aliasName,
      email: email?.toLowerCase(),
      role,
      phoneNumber,
    });
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getAllElectionUsersWithRoleAsElectionNominee = async (
  electionId: string
) => {
  try {
    await connectDB();
    const usersWithSubjects = await ElectionUser.find({
      electionId,
      role: "election_nominee",
    });
    if (!usersWithSubjects)
      return { success: false, message: "No Award User found" };
    return {
      success: true,
      data: JSON.parse(JSON.stringify(usersWithSubjects)),
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getElectionUserByIdAndElectionId = async ({
  id,
  electionId,
}: {
  id: string;
  electionId: string;
}) => {
  try {
    await connectDB();
    const user = await ElectionUser.aggregate([
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
          let: { nomineeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$nomineeId", { $toObjectId: "$$nomineeId" }] },
                    {
                      $eq: [
                        "$electionId",
                        new mongoose.Types.ObjectId(electionId),
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "nominations",
        },
      },
      {
        $unwind: {
          path: "$nominations",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "electioncategories",
          localField: "nominations.categoryId",
          foreignField: "_id",
          as: "nominations.categoryDetails",
        },
      },
      {
        $unwind: {
          path: "$nominations.categoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "votingpaymenttransactions",
          let: {
            categoryId: "$nominations.categoryId",
            nomineeId: "$nominations.nomineeId",
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
          as: "nominations.votesInfo",
        },
      },
      {
        $addFields: {
          "nominations.votes": {
            $ifNull: [
              { $arrayElemAt: ["$nominations.votesInfo.totalVotes", 0] },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          aliasName: { $first: "$aliasName" },
          email: { $first: "$email" },
          role: { $first: "$role" },
          phoneNumber: { $first: "$phoneNumber" },
          nominations: {
            $push: {
              $cond: [
                { $ifNull: ["$nominations._id", false] },
                {
                  _id: "$nominations._id",
                  categoryId: "$nominations.categoryId",
                  nomineeId: "$nominations.nomineeId",
                  electionId: "$nominations.electionId",
                  categoryDetails: "$nominations.categoryDetails",
                  votes: "$nominations.votes",
                },
                "$$REMOVE",
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          firstName: 1,
          lastName: 1,
          aliasName: 1,
          email: 1,
          role: 1,
          phoneNumber: 1,
          nominations: 1,
        },
      },
    ]);

    if (!user) return { success: false, message: "User not found" };
    return { success: true, data: JSON.parse(JSON.stringify(user[0])) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const resetElectionUserPassword = async (email: string) => {
  try {
    await connectDB();
    const user = await ElectionUser.findOne({ email: email.toLowerCase() });
    if (!user) return { success: false, message: "User not found" };
    user.password = process.env
      .NEXT_PUBLIC_NEW_ELECTION_USER_PASSWORD as string;
    const savedUser = await user.save();
    return { success: true, message: "Password reset successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const changeElectionUserPassword = async ({
  id,
  oldPassword,
  newPassword,
}: {
  id: string;
  oldPassword: string;
  newPassword: string;
}) => {
  try {
    if (
      id === null ||
      id === undefined ||
      id === "" ||
      oldPassword === null ||
      oldPassword === undefined ||
      oldPassword === "" ||
      newPassword === null ||
      newPassword === undefined ||
      newPassword === ""
    ) {
      return { success: false, message: "Invalid input" };
    }
    if (oldPassword === newPassword) {
      return {
        success: false,
        message: "New password cannot be the same as old password",
      };
    }

    await connectDB();
    const user = await ElectionUser.findById(id);
    if (!user) return { success: false, message: "User not found" };
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return { success: false, message: "Old password is incorrect" };
    }
    user.password = newPassword;
    const savedUser = await user.save();
    return { success: true, message: "Password changed successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const deleteElectionUser = async (id: string) => {
  try {
    await connectDB();
    const user = await ElectionUser.findByIdAndDelete(id);
    if (!user) return { success: false, message: "User not found" };
    return { success: true, message: "User deleted successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
