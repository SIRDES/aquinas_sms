"use server";
import { connectDB } from "@/lib/mongodb";
import Programme from "@/models/Programme";

export const addProgrammes = async () => {
  try {
    const programmes = [
      {

        name: "Business",
        isNewCurriculum: false,
      },
      { name: "generail Science", isNewCurriculum: false },
      {

        name: "Visual arts",
        isNewCurriculum: false,
      },
      { name: "General Arts", isNewCurriculum: false },
      { name: "Agric", isNewCurriculum: false },


    ];

    await connectDB();
    const result = await Programme.insertMany(programmes);
    console.log("result", result);
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};
export const getAllProgrammes = async () => {
  try {
    await connectDB();
    const programmes = await Programme.aggregate([
      {
        $match: {
          isDeleted: false,
          isSuspended: false,
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert `_id` to a string
          name: 1,
          isNewCurriculum: 1,
        },
      },
      {
        $sort: { name: 1 }, // Sort by name in ascending order
      },
    ]);
    // console.log("programmes", programmes);
    return { status: "success", data: programmes };
  } catch (err: any) {
    console.log(err);
    return { status: "error", message: err?.message || "Something went wrong" };
  }
};
