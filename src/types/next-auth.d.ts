import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      email: string;
      firstName: string;
      lastName: string;
      assignedClasses?: string[];
      subjects?: string[];
      staffNumber: string;
      deviceToken?: string;
      assignedClassesDetails?: any;
      subjectsDetails?: any;
      pushNotificationAllowed?: boolean;
      role: "admin" | "teacher" | "award_manager" | "election_nominee";
      gender?: string;
      phoneNumber?: string;
      userPermissions?: string[];
    };
    //  DefaultSession["user"];
  }
}
