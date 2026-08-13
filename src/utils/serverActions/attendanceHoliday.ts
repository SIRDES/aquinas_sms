"use server";
import { connectDB } from "@/lib/mongodb";
import AttendanceHoliday from "@/models/AttendanceHoliday";
import { getCurrentServerUser } from "../services/serverUserAuth";
import { USER_PERMISSIONS } from "../common";

type AttendanceHolidayType = {
    date: string;
    description: string;
    duration?: string;
}

export const createAttendanceHoliday = async (attendanceHoliday: AttendanceHolidayType) => {
    try {

        await getCurrentServerUser(USER_PERMISSIONS.SETTINGS_ATTENDANCE_HOLIDAY_CREATE)

        if (!attendanceHoliday.date || !attendanceHoliday.description) {
            return { error: "Date and description are required" };
        }
        const holidayDate = new Date(attendanceHoliday.date);
        // Normalize the date to midnight UTC to ensure uniqueness per day
        // holidayDate.setUTCHours(0, 0, 0, 0);

        const holiday = {
            date: holidayDate,
            description: attendanceHoliday.description,
            duration: attendanceHoliday.duration || "full_day",
        }
        await connectDB();

        const newAttendanceHoliday = await AttendanceHoliday.create(holiday);
        // console.log("newAttendanceHoliday", newAttendanceHoliday);
        return { success: true, message: "Attendance holiday created successfully", data: JSON.parse(JSON.stringify(newAttendanceHoliday)) };

    } catch (error: any) {
        // console.error("Error creating attendance holiday:", error);
        if (error.code === 11000) {
            return { success: false, message: "A holiday already exists for this date." };
        }
        return { success: false, message: error.message || "Failed to create attendance holiday" };
    }
};


export const getAllAttendanceHolidays = async ({
    searchText = "",
    page = 1,
    rowsPerPage = 50,
}: {
    searchText?: string;
    page?: number;
    rowsPerPage?: number;
}) => {
    try {
        await connectDB();

        let query = {};

        if (searchText) {
            query = {
                $or: [
                    { description: { $regex: searchText, $options: "i" } },
                ],
            };
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * rowsPerPage;

        // Fetch total count for pagination metadata
        const totalCount = await AttendanceHoliday.countDocuments(query);

        // Fetch attendance holidays with pagination and sorting
        const attendanceHolidays = await AttendanceHoliday.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(rowsPerPage);

        return {
            success: true,
            data: JSON.parse(JSON.stringify(attendanceHolidays)),
            page,
            rowsPerPage,
            totalCount,
            totalPages: Math.ceil(totalCount / rowsPerPage),
        };
    } catch (error: any) {
        console.error("Error fetching attendance holidays:", error);
        return { success: false, message: error.message || "Failed to fetch attendance holidays" };
    }
};


export const updateAttendanceHoliday = async (id: string, attendanceHoliday: AttendanceHolidayType) => {
    try {
        await getCurrentServerUser(USER_PERMISSIONS.SETTINGS_ATTENDANCE_HOLIDAY_UPDATE)

        if (!attendanceHoliday.date || !attendanceHoliday.description) {
            return { error: "Date and description are required" };
        }
        const holidayDate = new Date(attendanceHoliday.date);
        // Normalize the date to midnight UTC to ensure uniqueness per day
        // holidayDate.setUTCHours(0, 0, 0, 0);

        const holiday = {
            date: holidayDate,
            description: attendanceHoliday.description,
            duration: attendanceHoliday.duration || "full_day",
        }
        await connectDB();

        const updatedAttendanceHoliday = await AttendanceHoliday.findByIdAndUpdate(id, holiday, { new: true });
        // console.log("updatedAttendanceHoliday", updatedAttendanceHoliday);
        return { success: true, message: "Attendance holiday updated successfully", data: JSON.parse(JSON.stringify(updatedAttendanceHoliday)) };

    } catch (error: any) {
        // console.error("Error updating attendance holiday:", error);
        if (error.code === 11000) {
            return { success: false, message: "A holiday already exists for this date." };
        }
        return { success: false, message: error.message || "Failed to update attendance holiday" };
    }
};


export const deleteAttendanceHoliday = async (id: string) => {
    try {
        await getCurrentServerUser(USER_PERMISSIONS.SETTINGS_ATTENDANCE_HOLIDAY_DELETE)

        await connectDB();

        const attendanceHoliday = await AttendanceHoliday.findByIdAndDelete(id);
        return { success: true, message: "Attendance holiday deleted successfully" };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to delete attendance holiday" };
    }
};


// get all public holidays in Ghana for this year
export const getAllPublicHolidays = async () => {
    try {
        const year = new Date().getFullYear();
        // First try to fetch from Nager.Date API
        try {
            const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/GH`);
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    return {
                        success: true,
                        data: data.map((holiday: any) => ({
                            date: holiday.date,
                            description: holiday.name,
                            name: holiday.name,
                        })),
                    };
                }
            }
        } catch (apiError) {
            console.warn("Failed to fetch holidays from external API, using fallback:", apiError);
        }

        // Fallback for 2026
        if (year === 2026) {
            const holidays2026 = [
                { date: "2026-01-01", description: "New Year's Day", name: "New Year's Day" },
                { date: "2026-01-07", description: "Constitution Day", name: "Constitution Day" },
                { date: "2026-03-06", description: "Independence Day", name: "Independence Day" },
                { date: "2026-03-20", description: "Eid al-Fitr", name: "Eid al-Fitr" },
                { date: "2026-03-23", description: "Eid al-Fitr Holiday", name: "Eid al-Fitr Holiday" },
                { date: "2026-04-03", description: "Good Friday", name: "Good Friday" },
                { date: "2026-04-06", description: "Easter Monday", name: "Easter Monday" },
                { date: "2026-05-01", description: "May Day (Workers' Day)", name: "May Day (Workers' Day)" },
                { date: "2026-05-27", description: "Eid al-Adha", name: "Eid al-Adha" },
                { date: "2026-07-01", description: "Republic Day", name: "Republic Day" },
                { date: "2026-08-04", description: "Founders' Day", name: "Founders' Day" },
                { date: "2026-09-21", description: "Kwame Nkrumah Memorial Day", name: "Kwame Nkrumah Memorial Day" },
                { date: "2026-12-04", description: "Farmers' Day", name: "Farmers' Day" },
                { date: "2026-12-25", description: "Christmas Day", name: "Christmas Day" },
                { date: "2026-12-26", description: "Boxing Day", name: "Boxing Day" },
                { date: "2026-12-28", description: "Christmas Day Holiday (Observed)", name: "Christmas Day Holiday (Observed)" },
            ];
            return { success: true, data: holidays2026 };
        }

        // Generic fallback for other years (fixed-date holidays)
        const fixedHolidays = [
            { date: `${year}-01-01`, description: "New Year's Day", name: "New Year's Day" },
            { date: `${year}-01-07`, description: "Constitution Day", name: "Constitution Day" },
            { date: `${year}-03-06`, description: "Independence Day", name: "Independence Day" },
            { date: `${year}-05-01`, description: "May Day (Workers' Day)", name: "May Day (Workers' Day)" },
            { date: `${year}-07-01`, description: "Republic Day", name: "Republic Day" },
            { date: `${year}-08-04`, description: "Founders' Day", name: "Founders' Day" },
            { date: `${year}-09-21`, description: "Kwame Nkrumah Memorial Day", name: "Kwame Nkrumah Memorial Day" },
            { date: `${year}-12-25`, description: "Christmas Day", name: "Christmas Day" },
            { date: `${year}-12-26`, description: "Boxing Day", name: "Boxing Day" },
        ];

        // Find the first Friday in December for Farmers' Day
        let farmersDayDate = 1;
        for (let day = 1; day <= 7; day++) {
            const d = new Date(year, 11, day); // Month 11 is December
            if (d.getDay() === 5) { // 5 is Friday
                farmersDayDate = day;
                break;
            }
        }
        const farmersDayStr = `${year}-12-${farmersDayDate.toString().padStart(2, '0')}`;
        fixedHolidays.push({ date: farmersDayStr, description: "Farmers' Day", name: "Farmers' Day" });

        // Sort holidays by date
        fixedHolidays.sort((a, b) => a.date.localeCompare(b.date));

        return { success: true, data: fixedHolidays };

    } catch (error: any) {
        console.error("Error getting public holidays:", error);
        return { success: false, message: error.message || "Failed to get public holidays" };
    }
};