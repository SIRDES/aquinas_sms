"use server";
import { connectDB } from "@/lib/mongodb";
import SMSResult from "@/models/SMSResult";
import { getBulkSmsStatus } from "../services/sms";
import { getCurrentServerUser } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";

export const addSMSResult = async (
  data: Array<{
    sms_id: string;
    phoneNumber: string;
    smsProvider: string;
    message: string;
    status: string;
  }>,
) => {
  try {
    await connectDB();
    if (!data || data.length === 0) {
      return { success: false, message: "No data provided" };
    }
    const smsData = data.map(({ sms_id, status, message, phoneNumber, smsProvider }) => ({
      sms_id: sms_id,
      status: status.toLowerCase(),
      message,
      smsProvider,
      phoneNumber,
    }));

    await SMSResult.insertMany(smsData);

    return { success: true, message: "SMS added successfully" };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};


export const getSMSResults = async ({
  searchText = "",
  page = 1,
  rowsPerPage = 50,
}: {
  searchText?: string;
  page?: number;
  rowsPerPage?: number;
}) => {
  try {
    await getCurrentServerUser(USER_PERMISSIONS.SMS_RESULTS_VIEW)
    await connectDB();
    // Create a base query
    const query: any = {};

    // Add search functionality if searchText is provided
    if (searchText.trim()) {
      const searchRegex = new RegExp(searchText, "i"); // Case-insensitive search

      query.$or = [
        { message: new RegExp(`.*${searchText}.*`, "i") },
        { phoneNumber: new RegExp(`.*${searchText}.*`, "i") },
        { status: new RegExp(`.*${searchText}.*`, "i") },
      ];
    }
    // Get total count with the search filter applied
    const totalCount = await SMSResult.countDocuments(query);
    const totalPages = Math.ceil(totalCount / rowsPerPage);
    const skip = (page - 1) * rowsPerPage;

    // Find results with pagination
    const results = await SMSResult.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(rowsPerPage)
      .lean();
    return {
      success: true,
      data: JSON.parse(JSON.stringify(results)),
      totalCount,
      rowsPerPage,
      currentPage: page,
      totalPages,
    };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      message: err?.message || "An error occurred while fetching SMS results",
    };
  }
};

export const updateSMSResult = async (id: string, data: any) => {
  try {
    await connectDB();
    // 1️⃣ Update the doc and get the _id
    const updated = await SMSResult.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true, projection: { _id: 1 } },
    );

    if (!updated) {
      throw new Error("Not found");
    }
    return { success: true, message: "SMS result updated successfully" };
  } catch (err: any) {
    console.error(err);
    return { success: false, message: err?.message || "An error occurred" };
  }
};

export const checkAndUpdateSmsStatus = async () => {
  try {
    const smsResults = await SMSResult.find({
      status: { $in: ["pending", "submitted"] },
    })
      .where("status")
      .equals(new RegExp("^(pending|submitted)$", "i"));

    if (!smsResults || smsResults.length === 0) {
      return { success: true, message: "No SMS status updated" };
    }

    const smsIds = smsResults.map((smsResult: any) => smsResult.sms_id);
    const smsStatus = await getBulkSmsStatus({ msg_ids: smsIds });

    const statusData = smsStatus?.data || {};
    const smsStatusKeys = Object.keys(statusData);


    let updateOperations: any[] = [];

    if (smsStatusKeys.length > 0) {
      smsStatusKeys.forEach((key) => {
        const update = {
          updateOne: {
            filter: { sms_id: key },
            update: {
              $set: {
                status: statusData[key].message_status || "pending",
              },
            },
          },
        };
        updateOperations.push(update);
      });
      // console.log("updateOperations", JSON.stringify(updateOperations));

      await SMSResult.bulkWrite(updateOperations);
      return {
        success: true,
        message: `${smsStatusKeys.length} SMS status updated successfully`,
      };
    }

    return { success: true, message: "No SMS status updated" };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error?.message || "An error occurred" };
  }
};
