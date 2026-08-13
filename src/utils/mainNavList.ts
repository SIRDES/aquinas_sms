import { USER_PERMISSIONS } from "./common";

export const adminNavLists = [
  {
    id: 1,
    name: "Dashboard",
    href: "/dashboard",
    permission: "admin"
  },
  {
    id: 2,
    name: "Students",
    permission: USER_PERMISSIONS.STUDENT_VIEW_ALL,
    // href: "/students",
    children: [
      {
        id: 1,
        name: "Completed",
        href: "/students/completed",
        permission: USER_PERMISSIONS.STUDENT_VIEW_ALL,
      },
      {
        id: 2,
        name: "Form 3",
        href: "/students/3",
        permission: USER_PERMISSIONS.STUDENT_VIEW_ALL,
      },
      {
        id: 3,
        name: "Form 2",
        href: "/students/2",
        permission: USER_PERMISSIONS.STUDENT_VIEW_ALL,
      },
      {
        id: 4,
        name: "Form 1",
        href: "/students/1",
        permission: USER_PERMISSIONS.STUDENT_VIEW_ALL,
      },
    ],
  },
  {
    id: 3,
    name: "Order of merits",
    href: "/order-of-merits",
    permission: USER_PERMISSIONS.ORDER_OF_MERIT_VIEW,
  },
  {
    id: 4,
    name: "Attendance",
    href: "/attendance",
    permission: USER_PERMISSIONS.ATTENDANCE_VIEW_DASHBOARD,
  },
  {
    id: 5,
    name: "Staff",
    href: "/staff",
    permission: USER_PERMISSIONS.USER_VIEW_ALL,
  },
  {
    id: 6,
    name: "Exams",
    href: "/admin-exams",
    permission: USER_PERMISSIONS.EXAMS_VIEW_ALL,
  },

  {
    id: 7,
    name: "Payments",
    href: "/payments",
    permission: USER_PERMISSIONS.EXAMS_PAYMENTS_VIEW_ALL,
  },
  // {
  //   id: 8,
  //   name: "Admission",
  //   href: "/admission",
  // },
  {
    id: 9,
    name: "SMS Results",
    href: "/sms-results",
    permission: USER_PERMISSIONS.SMS_RESULTS_VIEW,
  },
  {
    id: 10,
    name: "Settings",
    href: "/settings",
    permission: USER_PERMISSIONS.SETTINGS_VIEW_ALL,
  },
];

export const teacherNavLists = [
  // {
  //   id: 1,
  //   name: "Dashboard",
  //   href: "/dashboard",
  // },
  {
    id: 2,
    name: "Exams",
    href: "/teacher",
  },
  // {
  //   id: 3,
  //   name: "Teachers",
  //   href: "/teachers",
  // },
  // {
  //   id: 3,
  //   name: "Audits",
  //   href: "/audits",
  // },
  // {
  //   id: 4,
  //   name: "Audit",
  //   href: "/settings/myAccount",
  // },
];

export const awardNavLists = [
  // {
  //   id: 1,
  //   name: "Dashboard",
  //   href: "/dashboard",
  // },
  {
    id: 2,
    name: "Award",
    href: "/award",
  },
  // {
  //   id: 3,
  //   name: "Teachers",
  //   href: "/teachers",
  // },
  // {
  //   id: 3,
  //   name: "Audits",
  //   href: "/audits",
  // },
  // {
  //   id: 4,
  //   name: "Audit",
  //   href: "/settings/myAccount",
  // },
];
