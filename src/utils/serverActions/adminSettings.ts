"use server";
import { connectDB } from "@/lib/mongodb";
import AdminSetting from "@/models/AdminSettings";

export const addAdminSetting = async () => {
    try {
        const batch = [
            {
                isAdmissionOpen: true,
                currentAdmissionId: "681fd13a0fa6b8b3c415ade7",
            },
        ];
        await connectDB();
        const result = await AdminSetting.insertMany(batch);
        return { success: true, message: "Batch added successfully" };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};
export const getAdminSetting = async () => {
    try {
        await connectDB();
        const adminSetting = await AdminSetting.aggregate([
            {
                $lookup: {
                    from: "admissions", // The name of the collection for Admission
                    localField: "currentAdmissionId",
                    foreignField: "_id",
                    as: "admissionDetails",
                },
            },
            {
                $unwind: {
                    path: "$admissionDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
        ]);
        return { success: true, data: JSON.parse(JSON.stringify(adminSetting[0])) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};

