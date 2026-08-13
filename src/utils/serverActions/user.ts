"use server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";
import { getCurrentServerUser, getCurrentServerUserWithoutPermission } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";
import bcrypt from "bcryptjs";

export const getAllStaff = async () => {
  try {
    const session = await getCurrentServerUser(USER_PERMISSIONS.USER_VIEW_ALL);
    // console.log("session getAllStaff", session)
    await connectDB();
    const usersWithSubjects = await User.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(session?.user?._id) },
          // role: { $ne: "admin" }
        },
      },
      {
        $lookup: {
          from: "subjects", // Join with subjects collection
          localField: "subjects",
          foreignField: "_id",
          as: "subjectDetails",
        },
      },
      {
        $lookup: {
          from: "classes", // Join with classes collection
          localField: "assignedClasses",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      {
        $addFields: {
          _id: { $toString: "$_id" },
          subjects: {
            $map: { input: "$subjects", as: "sub", in: { $toString: "$$sub" } },
          }, // Convert subject IDs to strings
          assignedClasses: {
            $map: {
              input: "$assignedClasses",
              as: "cls",
              in: { $toString: "$$cls" },
            },
          }, // Convert class IDs to strings
          subjectDetails: {
            $map: {
              input: "$subjectDetails",
              as: "sub",
              in: {
                _id: { $toString: "$$sub._id" },
                name: "$$sub.name",
                type: "$$sub.type",
                isNewCurriculum: "$$sub.isNewCurriculum",
              },
            },
          },
          classDetails: {
            $map: {
              input: "$classDetails",
              as: "cls",
              in: {
                _id: { $toString: "$$cls._id" },
                name: "$$cls.name",
                level: "$$cls.level",
              },
            },
          },
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          role: 1,
          phoneNumber: 1,
          email: 1,
          staffNumber: 1,
          subjects: 1,
          assignedClasses: 1,
          isSuspensed: 1,
          gender: 1,
          subjectDetails: 1,
          classDetails: 1,
          createdAt: 1,
          updatedAt: 1,
          userPermissions: 1,
        },
      },
      {
        $sort: { createdAt: -1 }, // Sort by staffNumber in ascending order
      },
    ]);

    return usersWithSubjects;
  } catch (err) {
    console.log(err);
    return err;
  }
};


export const getStaffById = async (id: string) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.USER_VIEW_DETAILS);
    await connectDB();
    const user = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "subjects",
          localField: "subjects",
          foreignField: "_id",
          as: "subjectDetails",
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "assignedClasses",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    if (!user || user.length === 0) return { success: false, message: "User not found" };
    return {
      success: true,
      data: JSON.parse(JSON.stringify(user[0])),
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err.message };
  }
};

export const updateStaff = async (id: string, data: any) => {

  await getCurrentServerUser(USER_PERMISSIONS.USER_UPDATE);

  try {
    await connectDB();
    const { subjectId, userPermissions, ...rest } = data;

    const updateData: any = { ...rest };

    if (data.role === "admin") {
      updateData.subjects = [];
      updateData.userPermissions = userPermissions || [];
    } else if (data.role === "teacher") {
      updateData.subjects = subjectId?.length > 0 ? subjectId : [];
      updateData.userPermissions = [];
    } else {
      updateData.subjects = [];
      updateData.userPermissions = [];
    }

    if (updateData.email) updateData.email = updateData.email.toLowerCase();

    const result = await User.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!result) return { success: false, message: "Failed to update staff" };

    return { success: true, data: { ...result, _id: result._id.toString() } };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err.message };
  }
};
export const activateDeactivateStaffAccount = async (id: string, data: { isSuspended: boolean }) => {
  try {
    if (typeof data.isSuspended !== "boolean") {
      return { success: false, message: "Invalid user status" };
    }
    await getCurrentServerUser(USER_PERMISSIONS.USER_ENABLE_DISABLE);


    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isSuspended: data.isSuspended },
      { new: true }
    );
    // console.log("updatedUser", updatedUser)
    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


// change password
export const changePassword = async ({ oldPassword, password }: { password: string, oldPassword: string }) => {
  try {
    const currentuser = await getCurrentServerUserWithoutPermission()
    await connectDB();
    // const currentuser = await getCurrentUser();

    const currentUser = await User.findById(currentuser.user._id).lean();
    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    const userInstance = new User(currentUser);

    const isPasswordValid = await userInstance.comparePassword(oldPassword);

    if (!isPasswordValid) {
      return { success: false, message: "Wrong Old password" };
    }

    // hash the password using bcrypt
    const saltRounds = parseInt(process.env.BCRYPT_SALT as string, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const updatedUser = await User.findByIdAndUpdate(
      currentuser?.user?._id,
      {
        password: hashedPassword,
      },
      { new: true } // Return the updated document
    );
    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)), message: "Password changed successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}


// reset a user password by an admin. Verify the admin password first
export const resetUserPassword = async ({ adminPassword, userId, password }: { userId: string, password: string, adminPassword: string }) => {
  try {
    const currentuser = await getCurrentServerUser(USER_PERMISSIONS.USER_RESET_PASSWORD);
    await connectDB();
    // verify to check if the requester is an admin
    const admin = await User.findById(currentuser.user._id).lean();
    if (!admin) {
      return { success: false, message: "Admin not found" };
    }

    const userInstance = new User(admin);

    const isPasswordValid = await userInstance.comparePassword(adminPassword);

    if (!isPasswordValid) {
      return { success: false, message: "Invalid admin password" };
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT as string, 10) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
      },
      { new: true } // Return the updated document
    );
    console.log("updatedUser>>>>>>>>>>>", updatedUser)
    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(updatedUser)), message: "User password reset successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}