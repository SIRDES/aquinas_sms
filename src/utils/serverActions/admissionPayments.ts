"use server"

import { connectDB } from "@/lib/mongodb";
import AdmissionPayment from "@/models/AdmissionPayments";
import mongoose from "mongoose";




export const getAllPaymentsForAnAdmission = async (admissionId: string) => {
    try {
        await connectDB();
        const admissionIdObjectId = new mongoose.Types.ObjectId(admissionId);
        const payments = await AdmissionPayment.aggregate([
            { $match: { admissionId: admissionIdObjectId } },
            {
                $lookup: {
                    from: "placedstudents",
                    localField: "placedStudentId",
                    foreignField: "_id",
                    as: "placedStudent"
                }
            },
            {
                $lookup: {
                    from: "admissions",
                    localField: "admissionId",
                    foreignField: "_id",
                    as: "admission"
                }
            },
            { $unwind: { path: "$placedStudent", preserveNullAndEmptyArrays: true } },
            { $unwind: { path: "$admission", preserveNullAndEmptyArrays: true } },
            { $sort: { createdAt: -1 } }
        ]);
        if (payments.length === 0) {
            return { success: false, message: "No payments found" };
        }
        return { success: true, data: JSON.parse(JSON.stringify(payments)) };
    } catch (err: any) {
        console.log(err);
        return { success: false, message: err?.message || "An error occurred" };
    }
}