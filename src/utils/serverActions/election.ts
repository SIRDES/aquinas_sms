"use server";
import { connectDB } from "@/lib/mongodb";
import Election from "@/models/Election";

export const addAward = async ({
  name,
  endDate,
}: {
  name: string;
  endDate: Date;
}) => {
  try {
    const data = {
      name: name?.trim(),
      endDate,
    };
    await connectDB();
    const result = await Election.insertOne(data);
    return { success: true, message: "Award added successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
export const getElections = async () => {
  try {
    await connectDB();
    const elections = await Election.find({}).sort({ createdAt: -1 }).lean();
    if (!elections) {
      return { success: false, message: "Awards not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(elections)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
export const getLatestElection = async () => {
  try {
    await connectDB();
    const election = await Election.find({ isSuspended: false })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean();
    if (!election) {
      return { success: false, message: "Award not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(election[0])) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const updateAward = async ({
  id,
  name,
  endDate,
  isSuspended,
}: {
  id: string;
  name: string;
  endDate: Date;
  isSuspended: boolean;
}) => {
  try {
    const data = {
      name: name?.trim(),
      endDate,
      isSuspended,
    };
    await connectDB();
    const result = await Election.updateOne({ _id: id }, { $set: data });
    if (!result) {
      return { success: false, message: "Award not found" };
    }
    return { success: true, message: "Award updated successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
