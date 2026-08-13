"use server";
import { connectDB } from "@/lib/mongodb";
import FridayTestBatch from "@/models/FridayTestBatch";
import { getCurrentServerUser } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";

export const addFridayTestBatch = async (data: {
  academicYear: string;
  name: string;
  date: string;
  subjectIds: string[];
  examType: string;
  yearGroup: string;
  form: string;
  isNewCurriculum: boolean;
  isSemester: boolean;
}) => {
  try {
    // core maths : 67a7c20a65f7639968515146
    // english : 67a7c20a65f763996851514c
    // Int. Science : 67a7c20a65f7639968515156
    // lit-in-eng : 67a7c20a65f7639968515158
    // french : 67a7c20a65f763996851514f
    // geo : 67a7c20a65f7639968515151
    // econs : 67a7c20a65f7639968515149
    // crs : 67a7c20a65f7639968515148
    // accountng: 67a7c20a65f763996851514d
    // e-maths: 67a7c20a65f763996851514b
    // history: 67a7c20a65f7639968515155
    // biology: 67a7c20a65f7639968515143
    // physics: 67a7c20a65f763996851515a
    // gen. agric: 67a7c20a65f7639968515150
    // animal husbandry: 67a7c20965f7639968515142
    // leader: 67a7c20a65f7639968515157
    // picture making: 67a7c20a65f763996851515b
    // sculpture: 67a7c20a65f763996851515c

    // to add

    // const batch = [
    //   {
    //     name: "End of form 1 first semeester exams",
    //     date: new Date(),
    //     // date: new Date("2025-02-28"),
    //     subjectIds: [],
    //     academicYear: "67f1c7d6cf2fb3f87227a36f",
    //     examType: "Semester",
    //     yearGroup: "2027",
    //     form: "1",
    //     isNewCurriculum: true,
    //     isSemester: true,
    //   },
    //   // {
    //   //   name: "5th and 6th Weeks Friday Test",
    //   //   date: new Date(),
    //   //   // date: new Date("2025-02-28"),
    //   //   subjectIds: ["67a7c20a65f7639968515146", "67a7c20a65f763996851514c", "67a7c20a65f7639968515149", "67a7c20a65f7639968515148", "67a7c20a65f763996851515a", "67a7c20a65f763996851515a", "67a7c20a65f763996851515b","67a7c20a65f7639968515154"],
    //   //   academicYear: "681f560b4f0c6260c74848be",
    //   //   examType: "Friday Test",
    //   //   form: "3",
    //   //   yearGroup: "2025",
    //   //   isSemester: false,
    //   // },
    // ];

    await getCurrentServerUser(USER_PERMISSIONS.SETTINGS_EXAMS_CREATE);
    const batch = {
      name: data.name,
      date: new Date(data.date) || new Date(),
      subjectIds: data.subjectIds,
      academicYear: data.academicYear,
      examType: data.examType,
      yearGroup: data.yearGroup,
      form: data.form,
      isNewCurriculum: data.isNewCurriculum,
      isSemester: data.isSemester,
    };
    // console.log("batch", batch);
    await connectDB();
    const result = await FridayTestBatch.create(batch);
    // console.log("result", result);
    if (!result) {
      return { success: false, message: "Failed to add exam" };
    }
    return { success: true, message: "Exam added successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const updateFridayTestBatch = async (
  _id: string,
  data: {
    academicYear: string;
    name: string;
    date: Date;
    subjectIds: string[];
    examType: string;
    yearGroup: string;
    form: string;
    isNewCurriculum: boolean;
    isSemester: boolean;
    isSuspended: boolean;
  }
) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.SETTINGS_EXAMS_UPDATE)
    await connectDB();
    const batch = await FridayTestBatch.findById(_id);
    if (!batch) {
      return { success: false, message: "Exam not found" };
    }
    const updatedBatch = await FridayTestBatch.findByIdAndUpdate(
      _id,
      { ...data },
      { new: true }
    );
    if (!updatedBatch) {
      return { success: false, message: "Failed to update batch" };
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(updatedBatch)),
      message: "Exam updated successfully",
    };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
export const getAllFridayTestBatch = async (getIsSuspended?: boolean) => {
  try {
    await connectDB();
    // const batches = await FridayTestBatch.find().sort({ createdAt: 1 });
    let match: any = {
      isDeleted: false,
    };
    if (!getIsSuspended) {
      match = {
        ...match,
        isSuspended: false,
      };
    }
    const batches = await FridayTestBatch.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: "academicyears", // The collection name for academic years
          localField: "academicYear", // The field in FridayTestBatch
          foreignField: "_id", // The field in academicYears
          as: "academicYearDetails",
        },
      },
      {
        $unwind: {
          path: "$academicYearDetails",
          preserveNullAndEmptyArrays: true, // In case there is no matching academicYear
        },
      },
      {
        $match: {
          "academicYearDetails.isDeleted": false,
          "academicYearDetails.isSuspended": false,
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert `_id` to string
          date: {
            $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$date" },
          }, // Convert date to ISO string
          name: 1,
          subjectIds: {
            $map: {
              input: "$subjectIds",
              as: "subjectId",
              in: { $toString: "$$subjectId" }, // Convert each subjectId to a string
            },
          },
          academicYearDetails: {
            name: "$academicYearDetails.name",
            _id: { $toString: "$academicYearDetails._id" }, // Include only name and id
          },
          form: 1,
          isNewCurriculum: 1,
          isDeleted: 1,
          isSuspended: 1,
          yearGroup: 1,
          isSemester: 1,
          examType: 1,
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    return { success: true, data: JSON.parse(JSON.stringify(batches)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getAllFridayTestBatchForSpecficYearGroup = async ({ getIsSuspended, yearGroup }: { getIsSuspended?: boolean, yearGroup: string }) => {
  try {
    await connectDB();
    // const batches = await FridayTestBatch.find().sort({ createdAt: 1 });
    let match: any = {
      isDeleted: false,
      yearGroup: yearGroup,
    };
    if (!getIsSuspended) {
      match = {
        ...match,
        isSuspended: false,
      };
    }
    const batches = await FridayTestBatch.aggregate([
      {
        $match: match,
      },
      {
        $lookup: {
          from: "academicyears", // The collection name for academic years
          localField: "academicYear", // The field in FridayTestBatch
          foreignField: "_id", // The field in academicYears
          as: "academicYearDetails",
        },
      },
      {
        $unwind: {
          path: "$academicYearDetails",
          preserveNullAndEmptyArrays: true, // In case there is no matching academicYear
        },
      },
      {
        $match: {
          "academicYearDetails.isDeleted": false,
          "academicYearDetails.isSuspended": false,
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert `_id` to string
          date: {
            $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$date" },
          }, // Convert date to ISO string
          name: 1,
          subjectIds: {
            $map: {
              input: "$subjectIds",
              as: "subjectId",
              in: { $toString: "$$subjectId" }, // Convert each subjectId to a string
            },
          },
          academicYearDetails: {
            name: "$academicYearDetails.name",
            _id: { $toString: "$academicYearDetails._id" }, // Include only name and id
          },
          form: 1,
          isNewCurriculum: 1,
          isDeleted: 1,
          isSuspended: 1,
          yearGroup: 1,
          isSemester: 1,
          examType: 1,
          createdAt: 1,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);
    return { success: true, data: JSON.parse(JSON.stringify(batches)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getBatchById = async (id: string) => {
  try {
    await connectDB();
    const batch = await FridayTestBatch.findById(id).lean();
    if (!batch) {
      return { success: false, message: "Batch not found" };
    }
    return { success: true, data: batch };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getBatchByName = async (name: string) => {
  try {
    await connectDB();
    const batch = await FridayTestBatch.findOne({ name }).lean();
    if (!batch) {
      return { success: false, message: "Batch not found" };
    }
    return { success: true, data: batch };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
