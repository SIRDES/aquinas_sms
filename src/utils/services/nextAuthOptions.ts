import { connectDB } from "@/lib/mongodb";

import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import { NextAuthOptions } from "next-auth";
import ElectionUser from "@/models/ElectionUser";
import { ELECTION_USER_TYPE } from "../constants";

export const nextAuthOPtions: NextAuthOptions = {
  providers: [
    // Email & Password
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: { email: {}, password: {}, user_type: {} },
      async authorize(credentials) {
        try {
          await connectDB();
          let users;
          if (credentials?.user_type === ELECTION_USER_TYPE) {
            users = await ElectionUser.findOne({
              email: credentials?.email?.toLowerCase(),
            });
          } else {
            users = await User.aggregate([
              {
                $match: {
                  email: credentials?.email?.toLowerCase(),
                },
              },
              {
                $lookup: {
                  from: "classes", // The name of the classes collection
                  localField: "assignedClasses",
                  foreignField: "_id",
                  as: "assignedClassesDetails", // Output field for populated classes
                },
              },
              {
                $lookup: {
                  from: "subjects", // The name of the subjects collection
                  localField: "subjects",
                  foreignField: "_id",
                  as: "subjectsDetails", // Output field for populated subjects
                },
              },
              {
                $project: {
                  email: 1,
                  firstName: 1,
                  lastName: 1,
                  role: 1,
                  assignedClasses: 1,
                  subjects: 1,
                  staffNumber: 1,
                  deviceToken: 1,
                  pushNotificationAllowed: 1,
                  gender: 1,
                  phoneNumber: 1,

                  password: 1,
                  userPermissions: 1,

                  assignedClassesDetails: {
                    $ifNull: ["$assignedClassesDetails", []],
                  }, // Ensure it's an array even if empty
                  subjectsDetails: { $ifNull: ["$subjectsDetails", []] }, // Ensure it's an array even if empty
                  // Add other fields you want to return
                  isSuspended: 1,
                  deleteBy: 1,
                },
              },
            ]);
          }
          const user =
            credentials?.user_type === ELECTION_USER_TYPE
              ? users
              : Array.isArray(users) && users.length > 0
                ? users[0]
                : null;
          if (!user) throw new Error("Invalid Email");
          if (user.isSuspended)
            throw new Error(
              "Your account has been deactivated. Contact the admin"
            );

          const userInstance = new User(user);
          const passwordMatch = await userInstance.comparePassword(
            credentials!.password
          );

          if (!passwordMatch) throw new Error("Wrong Password");

          delete user.password;

          return JSON.parse(JSON.stringify(user));
        } catch (error: any) {
          console.log("auth catch error", error);
          return error.message;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // console.log("session token", token);
      if (session.user) {
        session.user = token as any;
      }
      return session;
    },

    async signIn({ user }) {
      // console.log("sign in user", user);
      if (user.email) {
        return true;
      } else {
        // Return false to display a default error message

        throw new Error(user.toString());
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
    async jwt({ token, user }) {
      // console.log("user from jwt", user);
      // console.log("token from jwt", token);
      // 0 * 15 * 60 * 60

      if (user) {
        token = { ...token, ...user };
        return token;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge:
      process.env.NODE_ENV === "development"
        ? 30 * 24 * 60 * 60
        : 0.02 * 24 * 60 * 60,
  },
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
