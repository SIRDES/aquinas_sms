"use server";
const mongoose = require("mongoose");
import { connectDB } from "@/lib/mongodb";
import FridayTestBatch from "@/models/FridayTestBatch";
import FridayTestScore, { IFridayTestScore } from "@/models/FridayTestScore";
import Student from "@/models/Student";
import { AssessmentModesType } from "@/types/commonTypes";
import { assessmentModes, USER_PERMISSIONS } from "../common";
import { getRemarksAndGrade } from "../services/utils";
import { getCurrentServerUser } from "../services/serverUserAuth";

export const registerStudentsToSubject = async ({
  subjectId,
  fridayTestBatchId,
  yearGroup,
}: {
  subjectId: string;
  fridayTestBatchId: string;
  yearGroup: string;
}) => {
  try {
    const currentUser = await getCurrentServerUser(USER_PERMISSIONS.EXAMS_UPLOAD_SCORE);
    await connectDB();

    const subjectObjectId = new mongoose.Types.ObjectId(subjectId);
    const fridayTestBatchObjectId = new mongoose.Types.ObjectId(
      fridayTestBatchId,
    );

    const students = await Student.aggregate([
      {
        $match: {
          subjects: { $in: [subjectObjectId] },
          yearGroup: yearGroup,
        },
      },
      {
        $lookup: {
          from: "fridaytestscores",
          localField: "_id",
          foreignField: "student",
          as: "scores",
        },
      },
      {
        $addFields: {
          hasScore: {
            $anyElementTrue: {
              $map: {
                input: "$scores",
                as: "score",
                in: {
                  $and: [
                    { $eq: ["$$score.subject", subjectObjectId] },
                    {
                      $eq: [
                        "$$score.fridayTestBatchId",
                        fridayTestBatchObjectId,
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $match: {
          hasScore: false,
        },
      },
      {
        $project: {
          _id: 0,
          student: { $toString: "$_id" },
          grade: { $literal: "ic" },
          remarks: { $literal: "incomplete" },
          classScore: { $literal: 0 },
          projectScore: { $literal: 0 },
          groupWorkScore: { $literal: 0 },
          totalScore: { $literal: 0 },
          marks: { $literal: 0 },
          individualClassScore: { $literal: 0 },
          midSemScore: { $literal: 0 },
          practicalScore: { $literal: 0 },
          presentationScore: { $literal: 0 },
          assignmentScore: { $literal: 0 },
          subject: subjectObjectId,
          fridayTestBatchId: fridayTestBatchObjectId,
        },
      },
    ]);
    // console.log("students", students);
    if (students.length === 0) {
      return { success: true, message: "No new students to register." };
    }

    // Bulk insert only the new students
    const res = await FridayTestScore.insertMany(students);

    return {
      success: true,
      message: `${students.length} new students registered successfully`,
      count: students.length,
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const getAllFridayTestScoreForABatch = async ({
  fridayTestBatchId,
}: {
  fridayTestBatchId: string;
}) => {
  try {
    const currentUser = await getCurrentServerUser(USER_PERMISSIONS.EXAMS_VIEW_ALL);
    await connectDB();

    const fridayTestBatchObjectId = new mongoose.Types.ObjectId(
      fridayTestBatchId,
    );

    const scores = await FridayTestScore.aggregate(
      [
        // 🔥 FAST INDEX FILTER
        {
          $match: {
            fridayTestBatchId: fridayTestBatchObjectId,
            isDeleted: false,
            isSuspended: false,
          },
        },

        // ======================
        // STUDENT
        // ======================
        {
          $lookup: {
            from: "students",
            let: { sid: "$student" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$sid"] } } },
              {
                $project: {
                  firstName: 1,
                  lastName: 1,
                  studentId: 1,
                  ssId: 1,
                  yearGroup: 1,
                  parentPhoneNumber: 1,
                  classId: 1,
                },
              },
            ],
            as: "studentDetails",
          },
        },
        { $unwind: "$studentDetails" },

        // ======================
        // CLASS
        // ======================
        {
          $lookup: {
            from: "classes",
            let: { cid: "$studentDetails.classId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$cid"] } } },
              { $project: { name: 1, form: 1 } },
            ],
            as: "classDetails",
          },
        },
        { $unwind: "$classDetails" },

        // ======================
        // SUBJECT
        // ======================
        {
          $lookup: {
            from: "subjects",
            let: { subId: "$subject" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$subId"] } } },
              { $project: { name: 1, type: 1, isNewCurriculum: 1 } },
            ],
            as: "subjectDetails",
          },
        },
        { $unwind: "$subjectDetails" },

        // ======================
        // FINAL SHAPE
        // ======================
        {
          $project: {
            _id: 1,
            classScore: 1,
            projectScore: 1,
            groupWorkScore: 1,
            presentationScore: 1,
            assignmentScore: 1,
            totalScore: 1,
            marks: 1,
            grade: 1,
            remarks: 1,
            createdAt: 1,
            updatedAt: 1,
            fridayTestBatchId: 1,
            isNewCurriculum: 1,

            subject: {
              _id: "$subjectDetails._id",
              name: "$subjectDetails.name",
              type: "$subjectDetails.type",
              isNewCurriculum: "$subjectDetails.isNewCurriculum",
            },

            student: {
              _id: "$studentDetails._id",
              studentId: "$studentDetails.studentId",
              ssId: "$studentDetails.ssId",
              yearGroup: "$studentDetails.yearGroup",
              name: {
                $concat: [
                  "$studentDetails.firstName",
                  " ",
                  "$studentDetails.lastName",
                ],
              },
              parentPhoneNumber: "$studentDetails.parentPhoneNumber",
              class: {
                _id: "$classDetails._id",
                name: "$classDetails.name",
                form: "$classDetails.form",
              },
            },
          },
        },

        // ======================
        // SORT
        // ======================
        { $sort: { "student.name": 1 } },
      ],
      {
        allowDiskUse: true,
      },
    );

    return { status: "success", data: JSON.parse(JSON.stringify(scores)) };
  } catch (err: any) {
    console.error("Error in getAllFridayTestScoreForABatch:", err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const getAllFridayTestScoreForASubject = async ({
  subjectId,
  fridayTestBatchId,
  yearGroup,
}: {
  subjectId: string;
  fridayTestBatchId: string;
  yearGroup: string;
}) => {
  try {
    const currentUser = await getCurrentServerUser(USER_PERMISSIONS.EXAMS_VIEW_ALL);
    await connectDB();
    const subjectObjectId = new mongoose.Types.ObjectId(subjectId);
    const fridayTestBatchObjectId = new mongoose.Types.ObjectId(
      fridayTestBatchId,
    );
    const batches = await FridayTestScore.aggregate([
      {
        $match: {
          subject: subjectObjectId, // Ensure the subject matches
          fridayTestBatchId: fridayTestBatchObjectId, // Ensure batch matches
          isDeleted: false,
          isSuspended: false,
        },
      },
      {
        $lookup: {
          from: "students", // Collection name for Student model
          localField: "student",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      {
        $unwind: "$studentDetails", // Convert array to object
      },
      {
        $lookup: {
          from: "classes", // Collection name for Class model
          localField: "studentDetails.classId",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      {
        $unwind: "$classDetails", // Convert array to object
      },
      {
        $match: {
          "studentDetails.yearGroup": yearGroup, // Ensure the class form matches
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert _id to string
          classScore: 1,
          projectScore: 1,
          groupWorkScore: 1,
          individualClassScore: 1,
          midSemScore: 1,
          practicalScore: 1,
          presentationScore: 1,
          assignmentScore: 1,
          totalScore: 1,
          marks: 1,
          grade: 1,
          remarks: 1,
          subject: { $toString: "$subject" },
          fridayTestBatchId: { $toString: "$fridayTestBatchId" },
          isNewCurriculum: 1,
          createdAt: 1,
          updatedAt: 1,
          student: {
            _id: { $toString: "$studentDetails._id" },
            studentId: { $toString: "$studentDetails.studentId" },
            ssId: { $toString: "$studentDetails.ssId" },
            yearGroup: "$studentDetails.yearGroup",
            name: {
              $concat: [
                "$studentDetails.firstName",
                " ",
                "$studentDetails.lastName",
              ],
            },
            parentPhoneNumber: "$studentDetails.parentPhoneNumber", // Add parentPhoneNumber field
            class: {
              _id: { $toString: "$classDetails._id" },
              name: "$classDetails.name",
              form: "$classDetails.form",
            },
          },
        },
      },
      {
        $sort: { "student.name": 1 }, // Sort by student name ascending
      },
    ]);
    return { status: "success", data: JSON.parse(JSON.stringify(batches)) };
  } catch (err: any) {
    console.error(err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const getRankedFridayTestScoreForASubject = async ({
  subjectId,
  fridayTestBatchId,
  yearGroup,
}: {
  subjectId: string;
  fridayTestBatchId: string;
  yearGroup: string;
}) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.ORDER_OF_MERIT_VIEW)
    await connectDB();

    const subjectObjectId = new mongoose.Types.ObjectId(subjectId);
    const fridayTestBatchObjectId = new mongoose.Types.ObjectId(
      fridayTestBatchId,
    );

    const results = await FridayTestScore.aggregate(
      [
        // ======================
        // FAST FILTER (INDEX)
        // ======================
        {
          $match: {
            subject: subjectObjectId,
            fridayTestBatchId: fridayTestBatchObjectId,
            isDeleted: false,
            isSuspended: false,
          },
        },

        // ======================
        // STUDENT
        // ======================
        {
          $lookup: {
            from: "students",
            localField: "student",
            foreignField: "_id",
            as: "studentDetails",
          },
        },
        { $unwind: "$studentDetails" },

        // ======================
        // YEAR GROUP FILTER
        // ======================
        {
          $match: {
            "studentDetails.yearGroup": yearGroup,
          },
        },

        // ======================
        // CLASS
        // ======================
        {
          $lookup: {
            from: "classes",
            localField: "studentDetails.classId",
            foreignField: "_id",
            as: "classDetails",
          },
        },
        { $unwind: "$classDetails" },

        // ======================
        // SORT BY SCORE DESC
        // ======================
        { $sort: { totalScore: -1 } },

        // ======================
        // GROUP BY SCORE (TIES)
        // ======================
        {
          $group: {
            _id: "$totalScore",
            students: { $push: "$$ROOT" },
            count: { $sum: 1 },
          },
        },

        // ======================
        // SORT SCORE GROUPS
        // ======================
        { $sort: { _id: -1 } },

        // ======================
        // BUILD COMPETITION RANKS
        // ======================
        {
          $group: {
            _id: null,
            groups: { $push: "$$ROOT" },
          },
        },

        {
          $project: {
            ranked: {
              $reduce: {
                input: "$groups",
                initialValue: {
                  offset: 0,
                  result: [],
                },
                in: {
                  offset: {
                    $add: ["$$value.offset", "$$this.count"],
                  },
                  result: {
                    $concatArrays: [
                      "$$value.result",
                      {
                        $map: {
                          input: "$$this.students",
                          as: "student",
                          in: {
                            $mergeObjects: [
                              "$$student",
                              {
                                position: {
                                  $add: ["$$value.offset", 1],
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },

        { $unwind: "$ranked.result" },
        { $replaceRoot: { newRoot: "$ranked.result" } },

        // ======================
        // FINAL SHAPE
        // ======================
        {
          $project: {
            _id: { $toString: "$_id" },
            marks: 1,
            totalScore: 1,
            grade: 1,
            remarks: 1,
            position: 1,
            createdAt: 1,

            student: {
              _id: { $toString: "$studentDetails._id" },
              studentId: "$studentDetails.studentId",
              ssId: "$studentDetails.ssId",
              yearGroup: "$studentDetails.yearGroup",
              name: {
                $concat: [
                  "$studentDetails.firstName",
                  " ",
                  "$studentDetails.lastName",
                ],
              },
              parentPhoneNumber: "$studentDetails.parentPhoneNumber",
              class: {
                _id: { $toString: "$classDetails._id" },
                name: "$classDetails.name",
                form: "$classDetails.form",
              },
            },
          },
        },

        // ======================
        // FINAL ORDER
        // ======================
        { $sort: { position: 1 } },
      ],
      { allowDiskUse: true },
    );

    return { status: "success", data: JSON.parse(JSON.stringify(results)) };
  } catch (err: any) {
    console.error("Error in getRankedFridayTestScoreForASubject:", err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const getRankedTestScoresForAClass = async ({
  className,
  fridayTestBatchId,
  yearGroup,
}: {
  className: string;
  fridayTestBatchId: string;
  yearGroup: string;
}) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.ORDER_OF_MERIT_VIEW)

    await connectDB();

    const batchObjectId = new mongoose.Types.ObjectId(fridayTestBatchId);

    const results = await FridayTestScore.aggregate(
      [
        // ======================
        // FAST FILTER (INDEX)
        // ======================
        {
          $match: {
            fridayTestBatchId: batchObjectId,
            isDeleted: false,
            isSuspended: false,
          },
        },

        // ======================
        // STUDENT JOIN
        // ======================
        {
          $lookup: {
            from: "students",
            localField: "student",
            foreignField: "_id",
            as: "studentDetails",
          },
        },
        { $unwind: "$studentDetails" },

        // ======================
        // CLASS JOIN (FROM STUDENT)
        // ======================
        {
          $lookup: {
            from: "classes",
            localField: "studentDetails.classId",
            foreignField: "_id",
            as: "classDetails",
          },
        },
        { $unwind: "$classDetails" },

        // ======================
        // FILTER BY CLASS NAME + YEAR GROUP
        // ======================
        {
          $match: {
            "classDetails.name": className,
            "studentDetails.yearGroup": yearGroup,
          },
        },

        // ======================
        // SUBJECT JOIN
        // ======================
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subjectDetails",
          },
        },
        { $unwind: "$subjectDetails" },

        // ======================
        // GROUP PER STUDENT
        // ======================
        {
          $group: {
            _id: "$studentDetails._id",

            studentDetails: { $first: "$studentDetails" },
            classDetails: { $first: "$classDetails" },

            examTestScores: {
              $push: {
                _id: "$_id",
                totalScore: "$totalScore",
                grade: "$grade",
                remarks: "$remarks",
                marks: "$marks",
                classScore: "$classScore",
                projectScore: "$projectScore",
                groupWorkScore: "$groupWorkScore",
                presentationScore: "$presentationScore",
                assignmentScore: "$assignmentScore",
                subjectDetails: {
                  _id: "$subjectDetails._id",
                  name: "$subjectDetails.name",
                  shortName: "$subjectDetails.shortName",
                  type: "$subjectDetails.type",
                  isNoneScoring: "$subjectDetails.isNoneScoring",
                  isNewCurriculum: "$subjectDetails.isNewCurriculum",
                },
              },
            },

            overallScore: { $sum: "$totalScore" },

            subjectsInClassAccumulator: {
              $addToSet: {
                _id: "$subjectDetails._id",
                name: "$subjectDetails.name",
                shortName: "$subjectDetails.shortName",
                type: "$subjectDetails.type",
                isNoneScoring: "$subjectDetails.isNoneScoring",
                isNewCurriculum: "$subjectDetails.isNewCurriculum",
              },
            },
          },
        },

        // ======================
        // SORT BY OVERALL SCORE
        // ======================
        { $sort: { overallScore: -1 } },

        // ======================
        // GROUP BY SCORE (TIES)
        // ======================
        {
          $group: {
            _id: "$overallScore",
            students: { $push: "$$ROOT" },
            count: { $sum: 1 },
          },
        },

        { $sort: { _id: -1 } },

        // ======================
        // BUILD COMPETITION RANKS
        // ======================
        {
          $group: {
            _id: null,
            groups: { $push: "$$ROOT" },
          },
        },

        {
          $project: {
            ranked: {
              $reduce: {
                input: "$groups",
                initialValue: { offset: 0, result: [] },
                in: {
                  offset: {
                    $add: ["$$value.offset", "$$this.count"],
                  },
                  result: {
                    $concatArrays: [
                      "$$value.result",
                      {
                        $map: {
                          input: "$$this.students",
                          as: "student",
                          in: {
                            $mergeObjects: [
                              "$$student",
                              {
                                position: {
                                  $add: ["$$value.offset", 1],
                                },
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },

        { $unwind: "$ranked.result" },
        { $replaceRoot: { newRoot: "$ranked.result" } },

        // ======================
        // FINAL SHAPE
        // ======================
        {
          $project: {
            _id: { $toString: "$_id" },
            overallScore: 1,
            position: 1,

            student: {
              _id: { $toString: "$studentDetails._id" },
              studentId: "$studentDetails.studentId",
              ssId: "$studentDetails.ssId",
              yearGroup: "$studentDetails.yearGroup",
              name: {
                $concat: [
                  "$studentDetails.firstName",
                  " ",
                  "$studentDetails.lastName",
                ],
              },
              parentPhoneNumber: "$studentDetails.parentPhoneNumber",
              class: {
                _id: { $toString: "$classDetails._id" },
                name: "$classDetails.name",
                yearGroup: "$classDetails.yearGroup",
                form: "$classDetails.form",
              },
            },

            examTestScores: 1,
            subjectsInClassAccumulator: 1,
          },
        },

        // ======================
        // FINAL ORDER
        // ======================
        { $sort: { position: 1 } },
      ],
      { allowDiskUse: true },
    );

    // ======================
    // EXTRACT SUBJECTS IN CLASS
    // ======================
    const subjectsInClassMap = new Map<string, any>();

    results.forEach((r: any) => {
      r.subjectsInClassAccumulator.forEach((s: any) => {
        subjectsInClassMap.set(String(s._id), JSON.parse(JSON.stringify(s)));
      });
      delete r.subjectsInClassAccumulator;
    });

    const subjectsInClassArray = Array.from(subjectsInClassMap.values());

    return {
      status: "success",
      data: {
        students: JSON.parse(JSON.stringify(results)),
        subjectsInClass: subjectsInClassArray,
      },
    };
  } catch (err: any) {
    console.error("Error in getRankedTestScoresForAClass:", err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const getStudentsTestScoreForABatch = async ({
  batchId,
  studentId,
}: {
  batchId: string;
  studentId: string;
}) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.STUDENT_VIEW_EXAMS_REPORTS);
    await connectDB();
    const fridayTestBatchObjectId = new mongoose.Types.ObjectId(batchId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    const testScores = await FridayTestScore.aggregate([
      {
        $match: {
          fridayTestBatchId: fridayTestBatchObjectId,
          student: studentObjectId,
        },
      },
      {
        $lookup: {
          from: "subjects", // Collection name for Subject model
          localField: "subject",
          foreignField: "_id",
          as: "subjectDetails",
        },
      },
      {
        $unwind: "$subjectDetails", // Convert array to object
      },
      {
        $project: {
          _id: { $toString: "$_id" }, // Convert _id to string
          classScore: 1,
          projectScore: 1,
          groupWorkScore: 1,
          presentationScore: 1,
          assignmentScore: 1,
          totalScore: 1,
          marks: 1,
          grade: 1,
          remarks: 1,
          subject: {
            _id: { $toString: "$subjectDetails._id" }, // Convert subject._id to string
            name: "$subjectDetails.name",
            type: "$subjectDetails.type",
          },
          subjectDetails: {
            _id: { $toString: "$subjectDetails._id" }, // Convert subject._id to string
            name: "$subjectDetails.name",
            type: "$subjectDetails.type",
          },
          name: "$subjectDetails.name",
          type: "$subjectDetails.type",
          fridayTestBatchId: { $toString: "$fridayTestBatchId" }, // Convert fridayTestBatchId to string
          student: { $toString: "$student" }, // Convert student to string
        },
      },
    ]);

    return { status: "success", data: testScores };
  } catch (err: any) {
    console.error(err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};

export const getAYearGroupStudentsTestScoreForABatch = async ({
  batchId,
}: {
  batchId: string;
}) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.STUDENT_EXAMS_REPORT_DOWNLOAD);
    await connectDB();
    const fridayTestBatchObjectId = new mongoose.Types.ObjectId(batchId);

    const testScores = await FridayTestScore.aggregate([
      {
        $match: {
          fridayTestBatchId: fridayTestBatchObjectId,
        },
      },
      {
        $group: {
          _id: "$student",
          scores: {
            $push: {
              _id: { $toString: "$_id" },
              classScore: "$classScore",
              projectScore: "$projectScore",
              groupWorkScore: "$groupWorkScore",
              assignmentScore: "$assignmentScore",
              presentationScore: "$presentationScore",
              totalScore: "$totalScore",
              marks: "$marks",
              grade: "$grade",
              remarks: "$remarks",
              subject: "$subject",
              fridayTestBatchId: "$fridayTestBatchId",
            },
          },
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      { $unwind: "$studentDetails" },
      {
        $lookup: {
          from: "classes",
          localField: "studentDetails.classId",
          foreignField: "_id",
          as: "classDetails",
        },
      },
      { $unwind: "$classDetails" },

      // ✅ Lookup programmeDetails from programme field in classDetails
      {
        $lookup: {
          from: "programmes",
          localField: "classDetails.programme",
          foreignField: "_id",
          as: "programmeDetails",
        },
      },
      { $unwind: "$programmeDetails" },

      {
        $lookup: {
          from: "subjects",
          localField: "scores.subject",
          foreignField: "_id",
          as: "subjectDetails",
        },
      },
      {
        $lookup: {
          from: "fridaytestbatches",
          localField: "scores.fridayTestBatchId",
          foreignField: "_id",
          as: "batchDetails",
        },
      },
      { $unwind: "$batchDetails" },
      {
        $lookup: {
          from: "academicyears",
          localField: "batchDetails.academicYear",
          foreignField: "_id",
          as: "academicYearDetails",
        },
      },
      { $unwind: "$academicYearDetails" },

      {
        $project: {
          _id: 0,
          student: {
            _id: { $toString: "$studentDetails._id" },
            studentId: { $toString: "$studentDetails.studentId" },
            ssId: { $toString: "$studentDetails.ssId" },
            name: {
              $concat: [
                "$studentDetails.firstName",
                " ",
                "$studentDetails.lastName",
              ],
            },
            parentPhoneNumber: "$studentDetails.parentPhoneNumber",
            firstName: "$studentDetails.firstName",
            lastName: "$studentDetails.lastName",
            yearOfAdmission: "$studentDetails.yearOfAdmission",
            yearGroup: "$studentDetails.yearGroup",
            dob: "$studentDetails.dob",
            gender: "$studentDetails.gender",
            class: {
              _id: { $toString: "$classDetails._id" },
              name: "$classDetails.name",
              form: "$classDetails.form",
              programmeDetails: {
                _id: { $toString: "$programmeDetails._id" },
                name: "$programmeDetails.name",
                // code: "$programmeDetails.code",
              },
            },
          },
          batchInfo: "$batchDetails",
          academicYearDetails: "$academicYearDetails",
          scores: {
            $map: {
              input: "$scores",
              as: "score",
              in: {
                _id: "$$score._id",
                classScore: "$$score.classScore",
                projectScore: "$$score.projectScore",
                groupWorkScore: "$$score.groupWorkScore",
                assignmentScore: "$$score.assignmentScore",
                presentationScore: "$$score.presentationScore",
                totalScore: "$$score.totalScore",
                marks: "$$score.marks",
                grade: "$$score.grade",
                remarks: "$$score.remarks",
                subjectDetails: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$subjectDetails",
                        as: "subject",
                        cond: {
                          $eq: ["$$subject._id", "$$score.subject"],
                        },
                      },
                    },
                    0,
                  ],
                },
                fridayTestBatchId: { $toString: "$$score.fridayTestBatchId" },
              },
            },
          },
        },
      },

      // ✅ Sort students by class name
      {
        $sort: {
          "student.class.name": 1,
        },
      },
    ]);

    return { status: "success", data: JSON.parse(JSON.stringify(testScores)) };
  } catch (err: any) {
    console.error(err);
    return { status: "error", message: err?.message || "An error occurred" };
  }
};


export const updateStudentMarks = async ({
  student,
}: {
  student: {
    _id: string;
    classScore?: number;
    projectWork?: number;
    groupWork?: number;
    totalScore?: number;
    marks: number;
    grade: string;
    remarks: string;
  };
}) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.EXAMS_UPLOAD_SCORE)
    await connectDB();
    // Update student marks in FridayTestScore
    const existingRecord = await FridayTestScore.findByIdAndUpdate(
      student._id, // No need to convert to ObjectId
      {
        $set: {
          classScore: student?.classScore || 0,
          projectWork: student?.projectWork || 0,
          groupWork: student?.groupWork || 0,
          totalScore: student?.totalScore || 0,
          marks: student.marks,
          grade: student.grade,
          remarks: student.remarks,
        },
      },
      { new: true },
    );

    if (!existingRecord) {
      return { success: false, message: "Record not found" };
    }

    return {
      success: true,
      message: "Marks updated successfully",
      // data: existingRecord,
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const updateStudentMarksWithSSID = async ({
  student,
}: {
  student: {
    subjectId: string;
    batchId: string;
    ssId: string;
    classScore?: number;
    projectWork?: number;
    groupWork?: number;
    totalScore?: number;
    marks: number;
    grade: string;
    remarks: string;
  };
}) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.EXAMS_UPLOAD_SCORE)
    await connectDB();
    // Update student marks in FridayTestScore
    // Find the student by ssId to get their _id
    const studentRecord = await Student.findOne({ ssId: student.ssId });

    if (!studentRecord) {
      return { success: false, message: "Student not found" };
    }
    const existingRecord = await FridayTestScore.findOneAndUpdate(
      {
        student: studentRecord._id, // Match the student _id
        subject: new mongoose.Types.ObjectId(student.subjectId), // Match the subjectId
        fridayTestBatchId: new mongoose.Types.ObjectId(student.batchId), // Match the batchId
      },
      {
        $set: {
          classScore: student?.classScore || 0,
          projectWork: student?.projectWork || 0,
          groupWork: student?.groupWork || 0,
          totalScore: student?.totalScore || 0,
          marks: student.marks,
          grade: student.grade,
          remarks: student.remarks,
        },
      },
      { new: true },
    );
    if (!existingRecord) {
      return { success: false, message: "Record not found" };
    }

    return {
      success: true,
      message: "Marks updated successfully",
      // data: existingRecord,
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const updateMultipleStudentMarksWithSSID = async ({
  students,
}: {
  students: {
    subjectId: string;
    batchId: string;
    ssId: string;
    classScore?: number;
    projectWork?: number;
    groupWork?: number;
    totalScore?: number;
    marks: number;
    grade: string;
    remarks: string;
  }[];
}) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.EXAMS_UPLOAD_SCORE)
    await connectDB();
    // Update student marks in FridayTestScore
    // Find the student by ssId to get their _id
    const studentsSSId = students.map((student) => student.ssId);
    const studentsRecord = await Student.find({
      ssId: { $in: studentsSSId },
    }).select("_id ssId");

    if (!studentsRecord || studentsRecord.length === 0) {
      return { success: false, message: "Students not found" };
    }
    // match a student with his ssId
    const studentsWithId = students.map((student) => {
      const studentRecord = studentsRecord.find(
        (record) => record.ssId === student.ssId,
      );
      return {
        ...student,
        _studentID: studentRecord?._id,
      };
    });

    const updatesOps = studentsWithId.map((student) => ({
      updateOne: {
        filter: {
          student: student._studentID, // Match the student _id
          subject: new mongoose.Types.ObjectId(student.subjectId), // Match the subjectId
          fridayTestBatchId: new mongoose.Types.ObjectId(student.batchId), // Match the batchId
        },
        update: {
          $set: {
            classScore: student?.classScore || 0,
            projectWork: student?.projectWork || 0,
            groupWork: student?.groupWork || 0,
            totalScore: student?.totalScore || 0,
            marks: student.marks,
            grade: student.grade,
            remarks: student.remarks,
          },
        },
      },
    }));

    const existingRecord = await FridayTestScore.bulkWrite(updatesOps);

    if (!existingRecord) {
      return { success: false, message: "Record not found" };
    }

    return {
      success: true,
      message: "Marks updated successfully",
      // data: existingRecord,
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


export const updateMultipleStudentMarksWithCassRefID = async ({
  students,
  subjectId,
  batchId,
  assessmentMode,
}: {
  subjectId: string;
  batchId: string;
  assessmentMode: AssessmentModesType;
  students: {
    cassRefID: string;
    // classScore?: number;
    // projectWork?: number;
    // groupWork?: number;
    // totalScore?: number;
    assessmentScore: number;
    overallScore: number;
    // grade: string;
    // remarks: string;
  }[];
}) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.EXAMS_UPLOAD_SCORE)
    await connectDB();
    // Update student marks in FridayTestScore
    // console.log("students>>>>>>>>>>>>>>", students)
    // console.log("assessmentMode>>>>>>>>>>>>>>", assessmentMode)
    // console.log("subjectId>>>>>>>>>>>>>>", subjectId)
    // console.log("batchId>>>>>>>>>>>>>>", batchId)

    const assessmentModeDetails = assessmentModes.find(
      (mode) => mode.value === assessmentMode,
    );

    // console.log("assessmentModeDetails>>>>>>>>>>>>>>", assessmentModeDetails)

    if (!assessmentModeDetails) {
      return { success: false, message: "Invalid assessment mode" };
    }
    // Find the student by cassRefID to get their _id

    const studentsCassRefIDs = students.map((student) => student.cassRefID);



    // Gettinng students _id for each of the cassRefID
    const studentsRecord = await Student.find({
      cassRefID: { $in: studentsCassRefIDs },
    }).select("_id cassRefID");

    // console.log("studentsRecord>>>>>>>>>>>>>>", studentsRecord)

    if (!studentsRecord || studentsRecord.length === 0) {
      return { success: false, message: "Students not found" };
    }


    // get students FridayTestScore for updating with studentsRecord _id
    const studentsFridayTestScore = await FridayTestScore.find({
      student: { $in: studentsRecord.map((record) => record._id) },
      subject: new mongoose.Types.ObjectId(subjectId),
      fridayTestBatchId: new mongoose.Types.ObjectId(batchId)
    })

    // console.log("studentsFridayTestScore>>>>>>>>>>>>>>", studentsFridayTestScore)

    if (!studentsFridayTestScore || studentsFridayTestScore.length === 0) {
      return { success: false, message: "Student's test score not found" };
    }

    // match the students FridayTestScore with studentsRecord
    const studentsFridayTestScoreWithCassRefIDAndMarks = studentsFridayTestScore.map((student: IFridayTestScore) => {
      const studentRecord = studentsRecord.find(
        (record) => record._id.toString() === student.student.toString(),
      );
      const studentMarks = students.find(
        (record) => record.cassRefID === studentRecord?.cassRefID,
      );


      // marks: number;
      // classScore ?: number;
      // individualClassScore ?: number;
      // midSemScore ?: number;
      // practicalScore ?: number;
      // projectScore ?: number;
      // presentationScore ?: number;
      // assignmentScore ?: number;
      // groupWorkScore ?: number;
      // totalScore ?: number;
      // grade: string;
      // remarks: string;

      const assessmentScore = studentMarks?.assessmentScore || 0;
      const overallScore = studentMarks?.overallScore || 1;

      let actualScore = (assessmentScore / overallScore) * (assessmentModeDetails?.percent || 0);
      actualScore = Number(actualScore.toFixed(1));

      if (assessmentMode === "individual") {
        student.individualClassScore = actualScore;
      }
      else if (assessmentMode === "midSem") {
        student.midSemScore = actualScore;
      }
      else if (assessmentMode === "practical") {
        student.practicalScore = actualScore;
      }
      else if (assessmentMode === "groupWork") {
        student.groupWorkScore = actualScore;
      }
      else if (assessmentMode === "supervised") {
        student.marks = actualScore;
      }

      const totalScore = (student?.individualClassScore || 0) + (student?.midSemScore || 0) + (student?.practicalScore || 0) + (student?.groupWorkScore || 0) + (student?.marks || 0);

      const classScore = (student?.individualClassScore || 0) + (student?.midSemScore || 0) + (student?.practicalScore || 0) + (student?.groupWorkScore || 0);

      student.totalScore = Number(totalScore.toFixed(1));
      student.classScore = Number(classScore.toFixed(1));

      student.grade = getRemarksAndGrade(student?.totalScore || 0)?.grade
      student.remarks = getRemarksAndGrade(student?.totalScore || 0)?.remarks;


      return {
        _id: student._id,
        marks: student.marks,
        classScore: student.classScore,
        // projectScore: student.projectScore,
        individualClassScore: student.individualClassScore,
        midSemScore: student.midSemScore,
        practicalScore: student.practicalScore,
        groupWorkScore: student.groupWorkScore,
        // presentationScore: student.presentationScore,
        // assignmentScore: student.assignmentScore,
        totalScore: student.totalScore,
        grade: student.grade,
        remarks: student.remarks,
        subject: student.subject,
        student: student.student,
        fridayTestBatchId: student.fridayTestBatchId,
        cassRefID: studentRecord?.cassRefID
      };
    });


    // updates students FridayTestScore



    // match a student with his cassRefID
    // const studentsWithId = students.map((student) => {
    //   const studentRecord = studentsRecord.find(
    //     (record) => record.cassRefID === student.cassRefID,
    //   );
    //   return {
    //     ...student,
    //     _studentID: studentRecord?._id,
    //   };
    // });

    // console.log("studentsFridayTestScoreWithCassRefIDAndMarks>>>>>>>>>>>>>>", studentsFridayTestScoreWithCassRefIDAndMarks)

    const updatesOps = studentsFridayTestScoreWithCassRefIDAndMarks.map((student) => {

      return {
        updateOne: {
          filter: {
            _id: student._id,
          },
          update: {
            $set: {
              individualClassScore: student.individualClassScore,
              midSemScore: student.midSemScore,
              practicalScore: student.practicalScore,
              groupWorkScore: student.groupWorkScore,
              marks: student.marks,
              totalScore: student.totalScore,
              classScore: student.classScore,
              grade: student.grade,
              remarks: student.remarks,
            },
          },
        },
      };
    });

    // console.log("updatesOps>>>>>>>>>>>>>>>>", JSON.stringify(updatesOps, null, 2));

    const existingRecord = await FridayTestScore.bulkWrite(updatesOps);

    // console.log("existingRecord>>>>>>>>>>>>>>>>", JSON.stringify(existingRecord, null, 2));

    if (!existingRecord) {
      return { success: false, message: "Record not found" };
    }

    return {
      success: true,
      message: "Marks updated successfully",
      // data: existingRecord,
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


// export const deleteAScore = async (id: string) => {
//   try {
//     await connectDB();
//     // console.log("student>>>>>>>>>>>", student);
//     // Deletet test scores which matches studentId,subjectId and fridayTestBatchId
//     const existingRecord = await FridayTestScore.findByIdAndDelete(id);

//     if (!existingRecord) {
//       return { success: false, message: "Score not found" };
//     }

//     return {
//       success: true,
//       message: "Score deleted successfully",
//       // data: existingRecord,
//     };
//   } catch (err: any) {
//     console.error(err);
//     return { success: false, message: err?.message || "An error occurred" };
//   }
// };

export const deleteStudentPrevRegisterdSubject = async ({
  studentId,
  subjectId,
}: // fridayTestBatchId,
  {
    studentId: string;
    subjectId: string;
    // fridayTestBatchId: string;
  }) => {
  try {
    await connectDB();
    const existingRecord = await FridayTestScore.deleteMany({
      student: new mongoose.Types.ObjectId(studentId),
      subject: new mongoose.Types.ObjectId(subjectId),
    });

    if (!existingRecord) {
      return { success: false, message: "Record not found" };
    }

    return {
      success: true,
      message: "Subject deleted successfully",
      // data: existingRecord,
    };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};
// export const replaceFridayTestScoreSubjectSpecific = async () => {
//   try {
//     await connectDB();
    
//     const oldSubjectId = "685a81b40ea9f65999c2ebac";
//     const newSubjectId = "685441de72cf3cd5e517c2d6";

//     // Update all FridayTestScore records where the subject matches oldSubjectId
//     const result = await FridayTestScore.updateMany(
//       { subject: new mongoose.Types.ObjectId(oldSubjectId) },
//       { $set: { subject: new mongoose.Types.ObjectId(newSubjectId) } }
//     );

//     return {
//       success: true,
//       message: "Subject replaced successfully in FridayTestScore",
//       updatedCount: result.modifiedCount,
//       data: JSON.parse(JSON.stringify(result)),
//     };
//   } catch (err: any) {
//     console.error(err);
//     return { success: false, message: err?.message || "An error occurred" };
//   }
// };

