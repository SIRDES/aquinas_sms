import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Student from "@/models/Student";
import Class from "@/models/Class";
import { PipelineStage } from "mongoose";
import AcademicYear from "@/models/AcademicYear";
import Counter from "@/models/Counter";
import { getCurrentServerUser } from "@/utils/services/serverUserAuth";
import { USER_PERMISSIONS } from "@/utils/common";

export const POST = async (request: NextRequest) => {
  if (!request.body) {
    return NextResponse.json(
      { error: "Request body is null" },
      { status: 400 }
    );
  }

  await getCurrentServerUser(USER_PERMISSIONS.STUDENT_CREATE)

  const {

    students,
    classId,
    yearOfAdmission

  }: { students: Array<{ firstName: string, lastName: string, subjects: Array<string>, parentFirstName?: string, parentLastName?: string, ssId?: string, parentEmail?: string, parentPhoneNumber?: string, cassRefID?: string }>, classId: string, yearOfAdmission: string } = await request.json();
  try {
    await connectDB();
    const classInfo = await Class.findById(classId);

    if (!classInfo) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const lastStudentCount = await Counter.findOne({ id: `studentId_${yearOfAdmission}` })

    let nextIdNumber = lastStudentCount?.seq ? lastStudentCount.seq + 1 : 1;


    const studentsToInsert = [];

    const existingStudents = await Student.find({
      cassRefID: { $in: students.map(s => s.cassRefID) }
    }).select("cassRefID");

    const existingCassRefIDs = new Set(existingStudents.map(s => s.cassRefID));

    const duplicateStudents = [];

    const nullCassRefIDs = [];


    for (const student of students) {
      const { firstName, lastName, subjects, parentFirstName, parentLastName, ssId, parentEmail, parentPhoneNumber, cassRefID } = student;

      if (!firstName || !subjects || !parentPhoneNumber || !cassRefID) {
        NextResponse.json(
          { message: "All fields are required for each student" },
          { status: 400 }
        );
      }

      if (!cassRefID || cassRefID.trim() === "") {
        nullCassRefIDs.push(student);
        continue;
      }

      if (existingCassRefIDs.has(cassRefID)) {
        duplicateStudents.push(student);
        continue;
      }

      const studentId = `${classInfo.name.split(" ")[0]}/${(nextIdNumber++).toString().padStart(3, "0")}/${yearOfAdmission}`;

      studentsToInsert.push({
        firstName: firstName.toUpperCase().trim(),
        lastName: lastName?.toUpperCase()?.trim() || "",
        studentId: studentId.toUpperCase(),
        subjects,
        parentFirstName: parentFirstName?.toUpperCase()?.trim() || "",
        parentLastName: parentLastName?.toUpperCase()?.trim() || "",
        ssId: ssId?.trim() || "",
        parentEmail: parentEmail?.toLowerCase()?.trim() || "",
        parentPhoneNumber: parentPhoneNumber?.trim() || "",
        cassRefID: cassRefID?.trim() || "",
        classId,
        yearOfAdmission: yearOfAdmission.toString(),
        yearGroup: (Number(yearOfAdmission) + 3).toString(),
        password: "student@123",
      });
    }

    // console.log("studentsToInsert", studentsToInsert);
    const addedStudents = await Student.insertMany(studentsToInsert);

    if (!addedStudents || addedStudents.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: `No student was added. ${nullCassRefIDs.length > 0 ? `Students with empty cassRefIDs ${nullCassRefIDs.map(s => s.cassRefID).join(", ")} were not added because they are missing CASS Reference ID.` : ""} ${duplicateStudents.length > 0 ? `Students with cassRefIDs ${duplicateStudents.map(s => s.cassRefID).join(", ")} were not added because they already exist.` : ""}`,
          nullCassRefIDs,
          duplicateStudents
        },
        { status: 201 }
      );
    }

    await Counter.findOneAndUpdate(
      { id: `studentId_${yearOfAdmission}` },
      { $set: { seq: nextIdNumber - 1 } },
      { upsert: true }
    )
    return NextResponse.json(
      {
        success: true,
        message: `Students added successfully. ${nullCassRefIDs.length > 0 ? `Students with empty cassRefIDs ${nullCassRefIDs.map(s => s.cassRefID).join(", ")} were not added because they are missing CASS Reference ID.` : ""} ${duplicateStudents.length > 0 ? `Students with cassRefIDs ${duplicateStudents.map(s => s.cassRefID).join(", ")} were not added because they already exist.` : ""}`,
        nullCassRefIDs,
        duplicateStudents
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error?.message || "Error adding student" },
      { status: 500 }
    );
  }
};

export const GET = async (request: NextRequest) => {
  const form = request.nextUrl.searchParams.get("form");
  const yearGroup = request.nextUrl.searchParams.get("yearGroup");

  await getCurrentServerUser(USER_PERMISSIONS.STUDENT_VIEW_ALL)

  if (!form || !yearGroup) {
    return NextResponse.json(
      { message: "Form and year group are required" },
      { status: 400 }
    );
  }

  // console.log("form", form);
  try {
    await connectDB();



    // ✅ Use aggregation pipeline for more complex queries
    // ✅ Use $lookup to join with classes and programmes collections
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "classes",
          let: { classId: "$classId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$classId"] },
              },
            },
            {
              $lookup: {
                from: "programmes",
                localField: "programme",
                foreignField: "_id",
                as: "programmeInfo",
              },
            },
            {
              $unwind: {
                path: "$programmeInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: "classInfo",
        },
      },
      {
        $unwind: "$classInfo",
      },
    ];

    // ✅ Add optional $match **after** lookup/unwind
    pipeline.push({
      $match: {
        isDeleted: false,
        "classInfo.form": form,
        yearGroup: yearGroup
      },
    });

    // ✅ Final sort
    pipeline.push({
      $sort: { _id: -1 },
    });

    // ✅ Use it in aggregate call
    const students = await Student.aggregate(pipeline);

    return NextResponse.json({
      success: true,
      data: JSON.parse(JSON.stringify(students, null, 2)),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Error fetching students" },
      { status: 500 }
    );
  }
};
