import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Student from "@/models/Student";
import mongoose from "mongoose";
import { getCurrentServerUser } from "@/utils/services/serverUserAuth";
import { USER_PERMISSIONS } from "@/utils/common";

export const GET = async (request: NextRequest, context: any) => {
  const { params } = context;
  const { id } = await params;
  const batchId = request.nextUrl.searchParams.get("batchId") || "3";
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Student not found" },
      { status: 400 }
    );
  }
  await getCurrentServerUser(USER_PERMISSIONS.STUDENT_VIEW_DETAILS)

  try {
    await connectDB();
    const student = await Student.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }, // Filter by _id
      },
      {
        $lookup: {
          from: "classes", // Joining Class collection
          localField: "classId",
          foreignField: "_id",
          as: "classInfo",
        },
      },
      { $unwind: "$classInfo" }, // Convert classInfo array into an object
      {
        $lookup: {
          from: "programmes", // Joining Programme collection
          localField: "classInfo.programme",
          foreignField: "_id",
          as: "classInfo.programmeInfo",
        },
      },
      {
        $unwind: {
          path: "$classInfo.programmeInfo",
          preserveNullAndEmptyArrays: true,
        },
      }, // Unwind programme data
      {
        $lookup: {
          from: "subjects", // Joining Subjects collection
          localField: "subjects",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
    ]);

    if (student?.length === 0) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: student[0],
        message: "Student fetched successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Error fetching Student" },
      { status: 500 }
    );
  }
};
export const PUT = async (request: NextRequest, context: any) => {
  const { params } = context;
  const { id } = await params;

  if (!request.body) {
    return NextResponse.json(
      { success: false, message: "Request body is null" },
      { status: 400 }
    );
  }
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Student not found" },
      { status: 400 }
    );
  }


  await getCurrentServerUser(USER_PERMISSIONS.STUDENT_UPDATE)

  const {
    firstName,
    lastName,
    subjects,
    classId,
    parentFirstName,
    parentLastName,
    parentEmail,
    parentPhoneNumber,
    cassRefID,
  } = await request.json();

  if (!cassRefID || cassRefID.trim() === "") {
    return NextResponse.json(
      { success: false, message: "CASS Reference ID is required." },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Check if another student is already using this cassRefID
    const existingStudent = await Student.findOne({
      cassRefID: cassRefID.trim(),
      _id: { $ne: id },
    });
    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: "Student with this CASS Reference ID already exists." },
        { status: 400 }
      );
    }

    const updatedQRCode = await Student.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        subjects,
        classId,
        parentFirstName,
        parentLastName,
        parentEmail,
        parentPhoneNumber,
        cassRefID: cassRefID.trim(),
      },
      { new: true }
    );
    if (!updatedQRCode) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Student updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Error updating Student" },
      { status: 500 }
    );
  }
};
export const DELETE = async (request: NextRequest, context: any) => {
  const { params } = context;
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Student not found" },
      { status: 400 }
    );
  }
  try {
    await getCurrentServerUser(USER_PERMISSIONS.STUDENT_DELETE)
    await connectDB();
    const deletedQRCode = await Student.findByIdAndUpdate(
      id,
      {
        cassRefID: null,
        classId: null,
        ssId: null,
        isDeleted: true,
        isSuspended: true
      },
      { new: true }
    );
    if (!deletedQRCode) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Student deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Error deleting Student" },
      { status: 500 }
    );
  }
};
