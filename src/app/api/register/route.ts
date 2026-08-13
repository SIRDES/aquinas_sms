import { connectDB } from "@/lib/mongodb";
import Counter from "@/models/Counter";
import User from "@/models/User";
import { USER_PERMISSIONS } from "@/utils/common";
import { getCurrentServerUser } from "@/utils/services/serverUserAuth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
  await getCurrentServerUser(USER_PERMISSIONS.USER_CREATE);
  if (!request.body) {
    return NextResponse.json(
      { success: false, message: "Request body is null" },
      { status: 400 }
    );
  }
  console.log(request.body);
  const { firstName, lastName, email, role, subjectId, userPermissions, password } = await request.json();
  try {
    await connectDB();

    const userFound = await User.findOne({ email: email.toLowerCase() });
    if (userFound) {
      return NextResponse.json(
        { success: false, messsage: "User already exists with this email" },
        { status: 400 }
      );
    }

    const lastStaffCount = await Counter.findOne({ id: `staffNumber` })

    let nextStaffNumber = lastStaffCount?.seq ? lastStaffCount.seq + 1 : 1;

    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role,
      staffNumber: nextStaffNumber,
      subjects: role === "admin" ? [] : subjectId?.length > 0 ? subjectId : null,
      userPermissions: role === "teacher" ? [] : userPermissions?.length > 0 ? userPermissions : [],
    });
    const savedUser = await user.save();

    await Counter.findOneAndUpdate(
      { id: `staffNumber` },
      { $set: { seq: nextStaffNumber } },
      { upsert: true }
    )
    return NextResponse.json(
      { success: true, data: savedUser },
      { status: 200 }
    );
  } catch (e: any) {
    console.log(e);
    return NextResponse.json(
      {
        success: false,
        message: e?.message || "An error occurred, please try again",
      },
      { status: 500 }
    );
  }
};
