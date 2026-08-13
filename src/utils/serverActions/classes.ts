"use server";
import SuccessDialog from "@/components/SuccessAlert";
import { connectDB } from "@/lib/mongodb";
import Class from "@/models/Class";
import Student from "@/models/Student";
import { getCurrentServerUser } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";

export const addClasses = async () => {
  try {
    const classes = [
      {
        name: "Bus 1",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e1",
        isNewCurriculum: false,
      },
      {
        name: "Bus 2",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e1",
        isNewCurriculum: false,
      },
      {
        name: "Bus 3",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e1",
        isNewCurriculum: false,
      },
      {
        name: "Bus 4",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e1",
        isNewCurriculum: false,
      },
      {
        name: "GArt 1",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e4",
        isNewCurriculum: false,
      },
      {
        name: "GArt 2",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e4",
        isNewCurriculum: false,
      },
      {
        name: "GArt 3",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e4",
        isNewCurriculum: false,
      },
      {
        name: "GArt 4",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e4",
        isNewCurriculum: false,
      },
      {
        name: "GArt 5",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e4",
        isNewCurriculum: false,
      },
      {
        name: "GArt 6",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e4",
        isNewCurriculum: false,
      },
      {
        name: "VArt 1",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e3",
        isNewCurriculum: false,
      },
      {
        name: "VArt 2",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e3",
        isNewCurriculum: false,
      },
      {
        name: "AG",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e5",
        isNewCurriculum: false,
      },
      {
        name: "Sci 1",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e2",
        isNewCurriculum: false,
      },
      {
        name: "Sci 2",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e2",
        isNewCurriculum: false,
      },
      {
        name: "Sci 3",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e2",
        isNewCurriculum: false,
      },
      {
        name: "Sci 4",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e2",
        isNewCurriculum: false,
      },
      {
        name: "Sci 5",
        form: "completed",
        programme: "67a8848a49c2639dfb49c4e2",
        isNewCurriculum: false,
      },
    ];
    // console.log("classes", classes);
    await connectDB();
    const result = await Class.insertMany(classes);
    return { status: "success", data: JSON.parse(JSON.stringify(result)) };
  } catch (err: any) {
    console.log(err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const form1ClassIsNewCurrilum = async () => {
  try {
    await connectDB();
    const result = await Class.updateMany(
      { form: "1", isNewCurriculum: false },
      { $set: { isNewCurriculum: true } }
    );

    return { status: "success", data: JSON.parse(JSON.stringify(result)) };
  } catch (err: any) {
    console.log(err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const getAllClasses = async (form: string) => {
  try {
    await connectDB();
    const classes = await Class.aggregate([
      {
        $match: {
          isDeleted: false,
          isSuspended: false,
          form,
        },
      },
      {
        $lookup: {
          from: "programmes", // The collection name for programmes
          localField: "programme",
          foreignField: "_id",
          as: "programmeDetails",
        },
      },
      {
        $unwind: "$programmeDetails", // Unwind the array to get an object
      },
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert `_id` to a string
          name: 1,
          form: 1,
          isNewCurriculum: 1,
          "programmeDetails._id": { $toString: "$programmeDetails._id" }, // Convert nested `_id` to a string
          "programmeDetails.name": 1,
          "programmeDetails.isDeleted": 1,
          "programmeDetails.isSuspended": 1,
          createdAt: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: "$createdAt",
            },
          }, // Convert `createdAt` to string
          updatedAt: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M:%S.%LZ",
              date: "$updatedAt",
            },
          }, // Convert `updatedAt` to string
        },
      },
      {
        $sort: { name: 1 }, // Sort by name in ascending order
      },
    ]);

    return { status: "success", data: classes };
  } catch (err: any) {
    console.log(err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const promoteAForm = async ({
  fromForm,
  toForm,
}: {
  fromForm: string;
  toForm: string;
}) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.SETTINGS_MAKE_PROMOTION)
    await connectDB();

    const getToClass = await Class.find({ form: toForm })
      .select("_id name")
      .lean();

    // Skip student check if promoting to 'completed'
    if (toForm !== "completed") {
      const getToClassStudents = await Student.find({
        classId: { $in: getToClass.map((c) => c._id) },
      })
        .select("_id")
        .lean();
      if (getToClassStudents.length > 0) {
        return {
          success: false,
          message: `Students found in the form ${toForm}`,
        };
      }
    }

    const getFromClass = await Class.find({ form: fromForm })
      .select("_id name")
      .lean();

    if (getFromClass.length === 0 || getToClass.length === 0) {
      return { success: false, message: "No classes found" };
    }
    // console.log("getFromClass", getFromClass);
    // console.log("getToClass", getToClass);
    let promotion = [];
    // compare the names of the classes in fromForm with the ones in toForm and check if the names are the same add {name:name, fromId: _id, toId: _id} to the promotion array
    for (let i = 0; i < getFromClass.length; i++) {
      for (let j = 0; j < getToClass.length; j++) {
        if (getFromClass[i].name === getToClass[j].name) {
          promotion.push({
            name: getFromClass[i].name,
            fromId: getFromClass[i]._id,
            toId: getToClass[j]._id,
          });
        }
      }
    }
    if (promotion.length === 0) {
      return { success: false, message: "No classes found" };
    }
    // console.log("promotion", promotion);

    const ops = promotion.map((p) => ({
      updateMany: {
        filter: { classId: p.fromId },
        update: { $set: { classId: p.toId } },
      },
    }));

    const result = await Student.bulkWrite(ops);
    console.log("result", result);

    return { success: true, message: "Promotion successfully" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
