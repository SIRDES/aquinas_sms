"use server";
import { connectDB } from "@/lib/mongodb";
// import Student from "@/models/Student";
// import PaymentTransaction from "@/models/PaymentTransaction";
// import mongoose from "mongoose";
// import { contactNumbers } from "@/utils/services/utils";
import PlacedStudent, { IPlacedStudent } from "@/models/PlacedStudent";


export const AddMultiplePlacedStudents = async (students: Array<IPlacedStudent>) => {
  try {
    await connectDB();
    const result = await PlacedStudent.insertMany(students);
    return { status: "success", data: JSON.parse(JSON.stringify(result)) };
  } catch (err: any) {
    // console.log(err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
}

export const getAllPlacedStudents = async (yearOfAdmission: string) => {
  try {
    await connectDB();
    const students = await PlacedStudent.find({ yearOfAdmission }).lean();

    if (students.length === 0) {
      return { success: false, message: "No students found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(students)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getPlacedStudentById = async (id: string) => {
  try {
    await connectDB();
    const student = await PlacedStudent.findById(id).lean();
    console.log("student", student);
    if (!student) {
      return { success: false, message: "Student not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(student)) };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}

export const updatePlacedStudent = async ({ id, data }: { id: string, data: any }) => {
  try {
    await connectDB();
    const result = await PlacedStudent.updateOne({ _id: id }, { $set: { ...data, status: "completed" } });
    return { status: "success", data: JSON.parse(JSON.stringify(result)) };
  } catch (err: any) {
    return { status: "error", message: err?.message || "An error occurred" };
  }
}

export const getStudentByBeceIndexNumber = async ({
  beceIndexNumber,
  yearOfAdmission,
}: {
  beceIndexNumber: string;
  yearOfAdmission: string;
}) => {
  try {
    await connectDB();
    // const beceIndexNumber = "099";
    // const form = "3";
    // Use aggregation to fetch students by beceIndexNumber and then filter by form
    const students = await PlacedStudent.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [
                  { $arrayElemAt: [{ $split: ["$studentId", "/"] }, 1] },
                  beceIndexNumber,
                ],
              },
              { $eq: ["$yearOfAdmission", yearOfAdmission] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "classes", // Ensure this matches the actual collection name
          localField: "classId",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      { $unwind: "$classDetails" },
      // {
      //   $match: {
      //     "classDetails.form": form,
      //   },
      // },
    ]);
    if (students.length) {
      return { status: "success", data: students[0] };
    }

    return {
      status: "error",
      message: "No matching student found in the specified form",
    };
  } catch (err: any) {
    console.log(err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const isStudentWithHashedBeceIndexNumberExists = async ({ hashedBeceIndexNumbers, yearOfAdmission }: { hashedBeceIndexNumbers: Array<string>, yearOfAdmission: string }) => {
  try {
    await connectDB();
    // Step 2: Query MongoDB once to find all existing students
    const existingStudents = await PlacedStudent.find({
      hashedBeceIndexNumber: { $in: hashedBeceIndexNumbers },
      yearOfAdmission: yearOfAdmission,
      // status: { $ne: "placed" },
    })
      .select('hashedBeceIndexNumber firstName aggregate admissionProgramme')
      .lean();

    if (existingStudents.length > 0) {
      return { success: true, data: JSON.parse(JSON.stringify(existingStudents)), message: "Students exists" };
    }
    return { success: false, message: "Students does not exist" };
  } catch (err: any) {
    console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


export const getPlacedStudentByStudentId = async (studentId: string) => {
  try {
    await connectDB();
    const student = await PlacedStudent.findOne({ studentId: studentId?.toUpperCase() })
    if (student) {
      return { status: "success", data: JSON.parse(JSON.stringify(student)), message: "Student with this Student ID exists" };
    }
    return { status: "error", message: "Student with this Student ID does not exist" };
  } catch (err: any) {
    // console.log(err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const deletePlacedStudent = async (id: string) => {
  try {
    await connectDB();
    const result = await PlacedStudent.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return { success: false, message: "Student not found" };
    }
    return { success: true, message: "Student deleted successfully" };
  } catch (err: any) {
    // console.log(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
}
