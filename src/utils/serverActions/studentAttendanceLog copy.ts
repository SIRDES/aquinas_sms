"use server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import StudentAttendanceLog from "@/models/StudentAttendanceLog";
import AttendanceHoliday from "@/models/AttendanceHoliday";
import { StudentAttendanceLogType, TimeLogType } from "@/types/commonTypes";
import mongoose from "mongoose";
import { getCurrentServerUser } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";


// add multiple student attendance log
export const addMultipleStudentAttendanceLogs = async ({ year, month, form, studentsLogs }: {
    year: string,
    month: string,
    form: string,
    studentsLogs: StudentAttendanceLogType[]
}) => {
    try {
        // console.log("studentsLogs", studentsLogs);

        if (!studentsLogs || studentsLogs.length === 0) {
            return { success: false, message: "No student attendance logs provided" };
        }

        if (!year || !month || !form) {
            return { success: false, message: "Year, month and form are required" };
        }

        const validStudentsLogs = studentsLogs.filter(student => student.timeLogs && student.timeLogs.length > 0 && student.no);
        const studentsNumbers = validStudentsLogs.map(student => student.studentId);

        if (validStudentsLogs.length === 0) {
            return { success: false, message: "No valid student attendance logs provided" };
        }


        await connectDB();

        // get students whose class.form is equal to the form provided. The student class can be gotten using the classId. use aggregate to get the students
        const fetchedStudents = await Student.aggregate([
            {
                $lookup: {
                    from: "classes",
                    localField: "classId",
                    foreignField: "_id",
                    as: "class"
                }
            },
            { $unwind: "$class" },
            {
                $match: {
                    "class.form": form,
                    $expr: {
                        $in: [
                            { $arrayElemAt: [{ $split: [{ $ifNull: ["$studentId", ""] }, "/"] }, 1] },
                            studentsNumbers
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    studentId: 1,
                    // classId: 1,
                    firstName: 1,
                    lastName: 1,
                    // yearOfAdmission: 1,
                    // yearGroup: 1,
                    // ssId: 1,
                    // class: 1
                }
            }
        ]);


        // console.log("fetchedStudents", fetchedStudents);


        let newStudentAttendanceLogs: any[] = [];

        validStudentsLogs.forEach((student: StudentAttendanceLogType) => {
            const studentDetails = fetchedStudents.find((fetchedStudent: any) => fetchedStudent.studentId?.split("/")[1] === String(student.no).padStart(3, '0'));
            if (!studentDetails) return


            const timeLogs = student.timeLogs.map((timeLog: TimeLogType) => {
                return {
                    studentId: studentDetails._id,
                    date: `${year}/${month}/${timeLog.day}`,
                    morningTime: timeLog.morningTime,
                    afternoonTime: timeLog.afternoonTime,
                }
            })

            newStudentAttendanceLogs.push(...timeLogs)

        });

        // console.log("newStudentAttendanceLogs", newStudentAttendanceLogs);

        const updatesOps = newStudentAttendanceLogs.map((student) => {

            return {
                updateOne: {
                    filter: {
                        studentId: student.studentId,
                        date: student.date,
                    },
                    update: {
                        $set: {
                            studentId: student.studentId,
                            date: student.date,
                            morningTime: student.morningTime,
                            afternoonTime: student.afternoonTime,
                        },
                    },
                    upsert: true,
                },
            };
        });

        const updatedStudentAttendanceLogs = await StudentAttendanceLog.bulkWrite(updatesOps);
        console.log("updatedStudentAttendanceLogs", JSON.parse(JSON.stringify(updatedStudentAttendanceLogs)));

        if (!updatedStudentAttendanceLogs.modifiedCount && !updatedStudentAttendanceLogs.upsertedCount) {
            return { success: false, message: "No changes made. Possibly data already exists" };
        }

        return { success: true, message: "Attendance Log added successfully" };
    } catch (error: any) {
        console.error("Error adding student attendance logs:", error);
        return { success: false, message: error.message || "Failed to add student attendance logs" };
    }
}


const countWeekdays = (startDate: Date, endDate: Date): number => {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

/**
 * 
 * @param classId - id of the class to get attendance logs for
 * @param filterBy - type of filter to apply - week, month, or date range
 * @param startDate - start date for date range filter (optional)
 * @param endDate - end date for date range filter (optional)
 * @returns {success: boolean, message: string, data: {student: any, attendance: any[]}[]|null, totalExpectedDays: number}
 */
export const getStudentAttendanceLogsByClassId = async ({
    classId,
    filterBy,
    startDate,
    endDate
}: {
    classId: string,
    filterBy: "week" | "month" | "dateRange",
    startDate?: string,
    endDate?: string
}) => {
    try {
        await getCurrentServerUser(USER_PERMISSIONS.ATTENDANCE_VIEW_DASHBOARD)

        await connectDB();

        let query: any = {};

        let totalExpectedDays = 0;

        if (filterBy === "week") {
            // get the Monday to Friday of the current week
            const date = new Date();
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const weekStartDate = new Date(date.setDate(diff));
            const weekEndDate = new Date(date.setDate(diff + 4));

            totalExpectedDays = countWeekdays(weekStartDate, weekEndDate);

            query.date = {
                $gte: new Date(weekStartDate.toISOString().split("T")[0]),
                $lte: new Date(weekEndDate.toISOString().split("T")[0]),
            };
        } else if (filterBy === "month") {
            const date = new Date();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const monthStartDate = new Date(year, month - 1, 1);
            const monthEndDate = new Date(year, month, 0); // last day of the month

            totalExpectedDays = countWeekdays(monthStartDate, monthEndDate);

            query.date = {
                $gte: monthStartDate,
                $lte: monthEndDate,
            };
        } else if (filterBy === "dateRange") {
            if (!startDate || !endDate) {
                return { success: false, message: "Start date and end date are required" };
            }

            totalExpectedDays = countWeekdays(new Date(startDate), new Date(endDate));

            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // console.log("query", query);

        const [studentAttendanceLogs, attendanceHolidays] = await Promise.all([
            Student.aggregate([
                {
                    $match: {
                        classId: new mongoose.Types.ObjectId(classId),
                        isDeleted: { $ne: true }
                    }
                },
                {
                    $lookup: {
                        from: "studentattendancelogs",
                        let: { studentId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$studentId", "$$studentId"] },
                                            { $gte: ["$date", query.date.$gte] },
                                            { $lte: ["$date", query.date.$lte] }
                                        ]
                                    }
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    date: 1,
                                    morningTime: 1,
                                    afternoonTime: 1
                                }
                            }
                        ],
                        as: "attendance"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        student: {
                            _id: "$_id",
                            studentId: "$studentId",
                            firstName: "$firstName",
                            lastName: "$lastName",
                            middleName: "$middleName",
                        },
                        attendance: { $ifNull: ["$attendance", []] }
                    }
                },
                {
                    $sort: {
                        "student.firstName": 1,
                        "student.lastName": 1
                    }
                }
            ]),
            AttendanceHoliday.find(query.date ? { date: query.date } : {}).lean()
        ]);

        // console.log("studentAttendanceLogs", JSON.parse(JSON.stringify(studentAttendanceLogs)));
        const fullDayHolidays = attendanceHolidays.filter((h: any) => !h.duration || h.duration === "full_day").length;
        const morningHolidays = attendanceHolidays.filter((h: any) => h.duration === "morning").length;
        const afternoonHolidays = attendanceHolidays.filter((h: any) => h.duration === "afternoon").length;

        return {
            success: true,
            message: "Student attendance logs retrieved successfully",
            data: JSON.parse(JSON.stringify(studentAttendanceLogs)),
            attendanceholidays: JSON.parse(JSON.stringify(attendanceHolidays)),
            totalExpectedDays: totalExpectedDays - fullDayHolidays,
            totalExpectedMorningDays: totalExpectedDays - fullDayHolidays - morningHolidays,
            totalExpectedAfternoonDays: totalExpectedDays - fullDayHolidays - afternoonHolidays,
        };
    } catch (error: any) {
        console.error("Error getting student attendance logs:", error);
        return {
            success: false,
            message: error.message || "Failed to get student attendance logs",
            data: [],
        };
    }
}

export const getStudentAttendanceLogsByStudentId = async ({
    studentId,
    filterBy,
    startDate,
    endDate
}: {
    studentId: string,
    filterBy: "week" | "month" | "dateRange",
    startDate?: string,
    endDate?: string
}) => {
    try {
        await getCurrentServerUser(USER_PERMISSIONS.ATTENDANCE_VIEW_STUDENT_ATTENDANCE_RECORDS)

        await connectDB();

        let query: any = { studentId: new mongoose.Types.ObjectId(studentId) };
        let totalExpectedDays = 0;

        if (filterBy === "week") {
            const date = new Date();
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const weekStartDate = new Date(date.setDate(diff));
            const weekEndDate = new Date(date.setDate(diff + 4));

            totalExpectedDays = countWeekdays(weekStartDate, weekEndDate);

            query.date = {
                $gte: new Date(weekStartDate.toISOString().split("T")[0]),
                $lte: new Date(weekEndDate.toISOString().split("T")[0]),
            };
        } else if (filterBy === "month") {
            const date = startDate ? new Date(startDate) : new Date();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            const monthStartDate = new Date(year, month - 1, 1);
            const monthEndDate = new Date(year, month, 0);

            totalExpectedDays = countWeekdays(monthStartDate, monthEndDate);

            query.date = {
                $gte: monthStartDate,
                $lte: monthEndDate,
            };
        } else if (filterBy === "dateRange") {
            if (!startDate || !endDate) {
                return { success: false, message: "Start date and end date are required" };
            }

            totalExpectedDays = countWeekdays(new Date(startDate), new Date(endDate));

            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const [studentAttendanceLogs, attendanceHolidays] = await Promise.all([
            StudentAttendanceLog.find(query).sort({ date: -1 }).lean(),
            AttendanceHoliday.find(query.date ? { date: query.date } : {}).lean()
        ]);

        const fullDayHolidays = attendanceHolidays.filter((h: any) => !h.duration || h.duration === "full_day").length;
        const morningHolidays = attendanceHolidays.filter((h: any) => h.duration === "morning").length;
        const afternoonHolidays = attendanceHolidays.filter((h: any) => h.duration === "afternoon").length;

        return {
            success: true,
            message: "Student attendance logs retrieved successfully",
            data: JSON.parse(JSON.stringify(studentAttendanceLogs)),
            attendanceholidays: JSON.parse(JSON.stringify(attendanceHolidays)),
            totalExpectedDays: totalExpectedDays - fullDayHolidays,
            totalExpectedMorningDays: totalExpectedDays - fullDayHolidays - morningHolidays,
            totalExpectedAfternoonDays: totalExpectedDays - fullDayHolidays - afternoonHolidays,
        };
    } catch (error: any) {
        console.error("Error getting student attendance logs:", error);
        return {
            success: false,
            message: error.message || "Failed to get student attendance logs",
            data: [],
        };
    }
};