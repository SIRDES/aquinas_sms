"use server";
import { connectDB } from "@/lib/mongodb";
import AcademicYear from "@/models/AcademicYear";

export const addAcademicYear = async () => {
    try {
        const batch = [
            {
                name: "2023/2024",

            },
        ];
        await connectDB();
        const result = await AcademicYear.insertMany(batch);
        return { success: true, message: "Academic year added successfully" };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};
export const getAllAcademicYears = async () => {
    try {
        await connectDB();
        const batches = await AcademicYear.aggregate([
            {
                $match: {
                    isDeleted: false,
                    isSuspended: false,
                },
            },
            {
                $project: {
                    _id: { $toString: "$_id" }, // Convert `_id` to string
                    name: 1,
                    isDeleted: 1,
                    isSuspended: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
        ]);
        return { success: true, data: batches };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};

export const getAcademicYearById = async (id: string) => {
    try {
        await connectDB();
        const batch = await AcademicYear.findById(id).lean();
        if (!batch) {
            return { success: false, message: "Batch not found" };
        }
        return { success: true, data: batch };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};
