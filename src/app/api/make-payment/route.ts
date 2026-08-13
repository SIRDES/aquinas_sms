import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import PaymentTransaction from "@/models/PaymentTransaction";
import { makePayment } from "@/utils/services/api";

export const POST = async (request: NextRequest) => {
  if (!request.body) {
    return NextResponse.json(
      { error: "Request body is null" },
      { status: 400 }
    );
  }

  const { msisdn, studentId, batchId, network, examType, shortDescription, amount } =
    await request.json();
  try {
    await connectDB();
    function generateRandomSixDigitNumber() {
      return Math.floor(100000 + Math.random() * 900000);
    }

    const randomCode = generateRandomSixDigitNumber();
    const newPaymentTransaction = new PaymentTransaction({
      status: "Pending",
      examType: examType,
      code: randomCode,
      student: studentId,
      batchId: batchId,
      numberOfTimesUsed: 0,
      responseMessage: "",
      msisdn: `+${msisdn}`,
      network,
    });
    await newPaymentTransaction.save();
    // console.log("newPaymentTransaction", newPaymentTransaction);
    const paymentResponse = await makePayment({
      vendor: network === "airteltigo" ? "airtel" : network,
      number: msisdn,
      transactionId: newPaymentTransaction._id.toString(),
      shortDescription: shortDescription,
      amount
      // amount: "1.00"
    });
    // console.log("paymentResponse", paymentResponse);
    return NextResponse.json(
      {
        success: true,
        message: "Your payment is being processed",
        data: newPaymentTransaction,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // console.log("error adding payment", error.message);
    return NextResponse.json(
      { success: false, error: error?.message || "Error adding student" },
      { status: 500 }
    );
  }
};
