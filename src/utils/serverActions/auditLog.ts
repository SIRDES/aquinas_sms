"use server";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLogs";
import User from "@/models/User";
import { getCurrentServerUser } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";

type AuditLogType = {
    userId: string;
    action: string;
}

export const addAuditLog = async (auditLog: AuditLogType) => {
    try {
        await connectDB();

        const newAuditLog = await AuditLog.create(auditLog);
        return { success: true, message: "Audit log added successfully", data: JSON.parse(JSON.stringify(newAuditLog)) };

    } catch (error: any) {
        return { success: false, message: error.message || "Failed to add audit log" };
    }
};


export const getAllAuditLogs = async ({
    searchText = "",
    page = 1,
    rowsPerPage = 50,
}: {
    searchText?: string;
    page?: number;
    rowsPerPage?: number;
}) => {
    try {
        await getCurrentServerUser(USER_PERMISSIONS.AUDIT_LOGS_VIEW_ALL);

        await connectDB();

        // Calculate skip value for pagination
        const skip = (page - 1) * rowsPerPage;

        const pipeline: any[] = [
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            }
        ];

        if (searchText) {
            pipeline.push({
                $match: {
                    $or: [
                        { "user.firstName": { $regex: searchText, $options: "i" } },
                        { "user.lastName": { $regex: searchText, $options: "i" } },
                        { "user.email": { $regex: searchText, $options: "i" } },
                        { action: { $regex: searchText, $options: "i" } },
                    ]
                }
            });
        }

        // For totalCount
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await AuditLog.aggregate(countPipeline);
        const totalCount = countResult[0]?.total || 0;

        // For paginated data
        pipeline.push(
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: rowsPerPage },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    action: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    "user._id": 1,
                    "user.firstName": 1,
                    "user.lastName": 1,
                    "user.email": 1,
                    "user.role": 1
                }
            }
        );
        const auditLogs = await AuditLog.aggregate(pipeline);

        return {
            success: true,
            data: JSON.parse(JSON.stringify(auditLogs)),
            page,
            rowsPerPage,
            totalCount,
            totalPages: Math.ceil(totalCount / rowsPerPage),
        };
    } catch (error: any) {
        console.error("Error fetching audit logs:", error);
        return { success: false, message: error.message || "Failed to fetch audit logs" };
    }
};
