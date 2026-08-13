import { AssessmentModesType } from "@/types/commonTypes";

export const yearOfAdmissions = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2,
    new Date().getFullYear() - 3,
];

export const assessmentModes: { name: string, value: AssessmentModesType, percent: number }[] = [
    {
        name: "Individual Class Assessments (e.g., Classwork, Quizzes, Homework)",
        value: "individual",
        percent: 15
    },
    {
        name: "Mid-Sem",
        value: "midSem",
        percent: 15,
    },
    {
        name: "Practical or Portfolio or Performance Assessment (Individual)",
        value: "practical",
        percent: 10,
    },
    {
        name: "Group Projects, Research, or Case Studies, Practical/Lab work, Workshops, Performances, Presentations (Out of Class)",
        value: "groupWork",
        percent: 20,
    },
    {
        name: "Supervised Individual Termly",
        value: "supervised",
        percent: 40,
    },
];


// user permissions in terms of roles
export const userPermissions = [

    // order of merit permissions
    "ORDER_OF_MERIT:VIEW",
    // attendance permissions
    "ATTENDANCE:VIEW_DASHBOARD", "ATTENDANCE:VIEW_STUDENT_ATTENDANCE_RECORDS", "ATTENDANCE:ADD_HOLIDAYS", "ATTENDANCE:UPLOAD_LOG_FILE",
    // user permissions
    "USER:VIEW_ALL", "USER:VIEW_DETAILS", "USER:CREATE", "USER:UPDATE", "USER:ENABLE_DISABLE", "USER:RESET_PASSWORD",
    // student permissions
    "STUDENT:VIEW_ALL", "STUDENT:VIEW_DETAILS", "STUDENT:DETAILS_DOWNLOAD", "STUDENT:VIEW_EXAMS_REPORTS", "STUDENT:CREATE", "STUDENT:UPDATE", "STUDENT:DELETE", "STUDENT:EXAMS_REPORT_DOWNLOAD", "STUDENT:EXAMS_REPORT_SEND_TO_PARENT", "STUDENT:EXAMS_REPORT_NOTIFY_PARENT",
    // friday test permissions
    "EXAMS:VIEW_ALL", "EXAMS:UPLOAD_SCORE",
    // payment permissions
    "EXAMS_PAYMENTS:VIEW_ALL",
    // SMS Results permissions
    "SMS_RESULTS:VIEW", "SMS_RESULTS:RESEND",

    // settings permissions
    "SETTINGS:VIEW_ALL", "SETTINGS:EXAMS_VIEW_DETAILS", "SETTINGS:EXAMS_CREATE", "SETTINGS:EXAMS_UPDATE", "SETTINGS:MAKE_PROMOTION", "SETTINGS:ATTENDANCE_HOLIDAY_CREATE", "SETTINGS:ATTENDANCE_HOLIDAY_UPDATE", "SETTINGS:ATTENDANCE_HOLIDAY_DELETE",

    // audit logs permissions
    "AUDIT_LOGS:VIEW_ALL",
] as const;

type PermissionsType = typeof userPermissions[number];
type PermissionsObj = {
    [P in PermissionsType as P extends `${infer K}:${infer V}` ? `${K}_${V}` : P]: P
};

// userPermissions constants from userPermissions array
export const USER_PERMISSIONS = userPermissions.reduce((acc, permission) => {
    const key = permission.replace(":", "_");
    (acc as Record<string, string>)[key] = permission;
    return acc;
}, {} as PermissionsObj);


export const getFractionColor = (present: number, total: number) => {
    const ratio = present / total;
    if (ratio >= 0.8) return { bg: "#e8f5e9", text: "#4caf50" }; // Green
    if (ratio >= 0.50) return { bg: "#fff3e0", text: "#ff9800" }; // Orange
    return { bg: "#ffebee", text: "#f44336" }; // Red
};

export const getRateColor = (rate: number) => {
    if (rate >= 80) return "#4caf50";
    if (rate >= 50) return "#ff9800";
    return "#f44336";
};