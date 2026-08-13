"use server";
import { connectDB } from "@/lib/mongodb";
import Subject from "@/models/Subject";

export const addSubjectsAndProgrammes = async () => {
  try {
    const subjects = [

      { name: "rel. & moral edu", type: "core", isNewCurriculum: true, shortName: "RME" },
      { name: "physical education", type: "core", isNewCurriculum: true, shortName: "PE" },

      // { name: "685441de72cf3cd5e517c2ce", type: "core", isNewCurriculum: true },
      // { name: "Mathematics", type: "core", isNewCurriculum: true },
      // { name: "685441de72cf3cd5e517c2d0", type: "core", isNewCurriculum: true },


      // { name: "685441de72cf3cd5e517c2d1", type: "elective", isNewCurriculum: true },
      // { name: "agricultural science", type: "elective", isNewCurriculum: true },
      // { name: "additional mathematics", type: "elective", isNewCurriculum: true },
      // { name: "Art and Design Foundation", type: "elective", isNewCurriculum: true },
      // { name: "Arts and Design Studio", type: "elective", isNewCurriculum: true },
      // { name: "685441de72cf3cd5e517c2d6", type: "elective", isNewCurriculum: true },
      // { name: "Business Studies(685441de72cf3cd5e517c2d7)", type: "elective", isNewCurriculum: true },
      // { name: "Business Studies(Accounting)", type: "elective", isNewCurriculum: true },
      // { name: "685441de72cf3cd5e517c2d9", type: "elective", isNewCurriculum: true },
      // { name: "685441de72cf3cd5e517c2da", type: "elective", isNewCurriculum: true },
      // { name: "Computing", type: "elective", isNewCurriculum: true },
      // { name: "685441de72cf3cd5e517c2dc", type: "elective", isNewCurriculum: true },
      // { name: "685441de72cf3cd5e517c2dd", type: "elective", isNewCurriculum: true },
      // { name: "Government", type: "elective", isNewCurriculum: true },
      // { name: "History", type: "elective", isNewCurriculum: true },
      // { name: "info. & comm. tech(685441de72cf3cd5e517c2e0)", type: "elective", isNewCurriculum: true },
      // { name: "Literature-in-English", type: "elective", isNewCurriculum: true },
      // { name: "685441de72cf3cd5e517c2e2", type: "elective", isNewCurriculum: true },
      // { name: "685441de72cf3cd5e517c2e3", type: "elective", isNewCurriculum: true },
      // { name: "685441de72cf3cd5e517c2e4(Christian)", type: "elective", isNewCurriculum: true },
      // { name: "685441de72cf3cd5e517c2e5", type: "elective", isNewCurriculum: true },


      // { name: "rel. & moral edu", type: "core", isNewCurriculum: false },
      // { name: "physical education", type: "core", isNewCurriculum: false },
      // { name: "info. & comm. tech", type: "core", isNewCurriculum: false },

      // {
      //   type: "elective",
      //   name: "animal husbandry",
      //   isNewCurriculum: false,
      // },
      // { type: "elective", name: "biology", isNewCurriculum: false },
      // {
      //   type: "elective",
      //   name: "business management",
      //   isNewCurriculum: false,
      // },
      // { type: "elective", name: "chemistry", isNewCurriculum: false },
      // { name: "core maths", type: "core", isNewCurriculum: false },
      // {
      //   name: "cost accounting",
      //   type: "elective",
      //   isNewCurriculum: false,
      // },
      // { name: "crs", type: "elective", isNewCurriculum: false },
      // { type: "elective", name: "economics", isNewCurriculum: false },
      // { type: "elective", name: "elective ict", isNewCurriculum: false },
      // { name: "elective maths", type: "elective", isNewCurriculum: false },
      // { name: "english", type: "core", isNewCurriculum: false },
      // {
      //   type: "elective",
      //   name: "financial accounting",
      //   isNewCurriculum: false,
      // },
      // {
      //   type: "elective",
      //   name: "food and nutrition",
      //   isNewCurriculum: false,
      // },
      // { name: "french", type: "elective", isNewCurriculum: false },
      // {
      //   name: "general agriculture",
      //   type: "elective",
      //   isNewCurriculum: false,
      // },
      // { name: "geography", type: "elective", isNewCurriculum: false },
      // { name: "gka", type: "elective", isNewCurriculum: false },
      // { type: "elective", name: "government", isNewCurriculum: false },
      // { name: "graphic design", type: "elective", isNewCurriculum: false },
      // { name: "history", type: "elective", isNewCurriculum: false },
      // { type: "core", name: "integrated science", isNewCurriculum: false },
      // { type: "elective", name: "leather works", isNewCurriculum: false },
      // {
      //   type: "elective",
      //   name: "literature in english",
      //   isNewCurriculum: false,
      // },
      // {
      //   name: "management in living",
      //   type: "elective",
      //   isNewCurriculum: false,
      // },
      // { name: "physics", type: "elective", isNewCurriculum: false },
      // { type: "elective", name: "picture making", isNewCurriculum: false },
      // { type: "elective", name: "sculpture", isNewCurriculum: false },
      // { name: "685441de72cf3cd5e517c2d0", type: "core", isNewCurriculum: false },
      // {
      //   type: "elective",
      //   name: "music",
      //   isNewCurriculum: false,
      // },
    ];

    console.log("subjects", subjects);
    await connectDB();
    const result = await Subject.insertMany(subjects);
    console.log("result", result);
    return { success: true, message: "Subjects added successfullu" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
export const getAllSubjects = async () => {
  try {
    await connectDB();
    const subjects = await Subject.aggregate([
      {
        $match: {
          isDeleted: false,
          isSuspended: false,
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert `_id` to a string
          name: {
            $cond: [
              { $eq: ["$isNewCurriculum", true] },
              { $concat: ["$name", " (new curriculum)"] },
              "$name"
            ]
          },
          type: 1,
          isNewCurriculum: 1,
          lowerName: { $toLower: "$name" }, // Add a lowercase version of name for sorting
        },
      },
      {
        $sort: { lowerName: 1 }, // Sort by lowercase name in ascending order
      },
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          isNewCurriculum: 1,
        },
      },
    ]);
    // console.log("subjects", subjects);
    return { status: "success", data: JSON.parse(JSON.stringify(subjects)) };
  } catch (err: any) {
    console.log(err);
    return { status: "", message: err?.message || "An error occurred" };
  }
};
export const getAllNewCurriculumSubjects = async () => {
  try {
    await connectDB();
    const subjects = await Subject.aggregate([
      {
        $match: {
          isDeleted: false,
          isSuspended: false,
          isNewCurriculum: true,
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert `_id` to a string
          name: 1,
          type: 1,
          isNewCurriculum: 1,
          upperName: { $toUpper: "$name" }, // Add a lowercase version of name for sorting
        },
      },
      {
        $sort: { upperName: 1 }, // Sort by lowercase name in ascending order
      },
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          isNewCurriculum: 1,
        },
      },
    ]);
    // console.log("subjects", subjects);
    return { status: "success", data: JSON.parse(JSON.stringify(subjects)) };
  } catch (err: any) {
    console.log(err);
    return { status: "", message: err?.message || "An error occurred" };
  }
};
