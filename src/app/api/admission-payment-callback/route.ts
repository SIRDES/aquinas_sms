import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { sendSms } from "@/utils/services/sms";
import AdmissionPayment from "@/models/AdmissionPayments";
import PlacedStudent from "@/models/PlacedStudent";


const generateAdmissionCode = () => {
  const characters = "0123456789";
  let admissionCode = "";
  for (let i = 0; i < 6; i++) {
    admissionCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return admissionCode;
}

export const POST = async (request: NextRequest) => {
  const formData = await request.formData();
  const transaction_id = formData.get("transaction_id")?.toString();
  const responseMessage = formData.get("responseMessage")?.toString();
  const status = formData.get("status")?.toString();

  if (!transaction_id) {
    return NextResponse.json(
      // { success: false, message: "Transaction ID is required" },
      { status: 200 }
    );
  }

  try {
    await connectDB();

    // Update PaymentTransaction and fetch related data
    const updateFields: any = { responseMessage, status };


    const updatedTransaction = await AdmissionPayment.findByIdAndUpdate(
      transaction_id,
      updateFields,
      { new: true }
    );
    if (!updatedTransaction) {
      return NextResponse.json(
        // { success: false, message: "Transaction not found" },
        { status: 200 }
      );
    }


    if (status?.toUpperCase() === "SUCCESS") {
      const studentId = updatedTransaction.placedStudentId?.toString() || "";
      const parentPhoneNumber = updatedTransaction.parentPhoneNumber || ""
      const beceIndexNumber = updatedTransaction.beceIndexNumber || ""

      const admissionCode = generateAdmissionCode();

      const result = await PlacedStudent.findByIdAndUpdate(
        studentId,
        { admissionCode, parentPhoneNumber, beceIndexNumber, status: "started" },
        { new: true }
      )

      if (!result) {
        return NextResponse.json(
          // { success: false, message: "Student not found after update" },
          { status: 200 }
        );
      }

      // send admission code to parent/Guardian
      await sendSms({
        recipients: [parentPhoneNumber],
        message: `The admission code for ${result.firstName?.toUpperCase()?.trim()} is ${admissionCode}. Kindly login to your account to complete your admission process.`,
      });

    }


    return NextResponse.json(
      {
        // success: true,
        // message: "Transaction updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      // { success: false, error: error?.message || "Error updating transaction" },
      { status: 200 }
    );
  }
};
