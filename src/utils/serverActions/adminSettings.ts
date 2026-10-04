"use server";
import { connectDB } from "@/lib/mongodb";
import AdminSetting from "@/models/AdminSettings";
import { getCurrentServerUser } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";
import { addAuditLog } from "./auditLog";

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
export const getAdminSettingAtSettingsPage = async () => {
    await getCurrentServerUser(USER_PERMISSIONS.SETTINGS_GENERAL_VIEW)
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


// update admin settings
export const updateAdminSetting = async (data: any) => {
    const currentUser = await getCurrentServerUser(USER_PERMISSIONS.SETTINGS_SMS_PROVIDER_UPDATE)

    try {
        await connectDB();
        const prevAdminSetting = await AdminSetting.findOne({});
        const adminSetting = await AdminSetting.findOneAndUpdate(
            {},
            { ...data },
            { upsert: true, new: true }
        );
        await addAuditLog({
            userId: currentUser?.user?._id,
            action: `Admin settings changed from ${JSON.stringify(prevAdminSetting, null, 2)} to ${JSON.stringify(adminSetting, null, 2)}.`,        // Remove the trailing dot.
        })
        return { success: true, data: JSON.parse(JSON.stringify(adminSetting)) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
};

