import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { makePayment } from "@/utils/services/api";
import VotingPaymentTransaction from "@/models/VotingPaymentTransaction";
const { BASE_URL } = process.env;

export const POST = async (request: NextRequest) => {
  if (!request.body) {
    return NextResponse.json(
      { error: "Request body is null" },
      { status: 400 }
    );
  }
  const {
    numberOfVotes,
    nomineeId,
    nomineeCode,
    electionId,
    categoryId,
    amount,
    msisdn,
    network,
    shortDescription,
  } = await request.json();
  try {
    await connectDB();

    const newPaymentTransaction = new VotingPaymentTransaction({
      status: "Success",
      responseMessage: "",
      numberOfVotes,
      nomineeId,
      nomineeCode,
      electionId,
      categoryId,
      amount,
      msisdn: `+${msisdn}`,
      network,
    });
    await newPaymentTransaction.save();
    // console.log("newPaymentTransaction", newPaymentTransaction);
    let callback = `${BASE_URL}/api/voting-payment-callback`;

    // const paymentResponse = await makePayment({
    //   vendor: network === "airteltigo" ? "airtel" : network,
    //   number: msisdn,
    //   transactionId: newPaymentTransaction._id.toString(),
    //   shortDescription: shortDescription,
    //   amount,
    //   paymentCallback: callback,
    // });
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
    console.log("error adding payment", error.message);
    return NextResponse.json(
      { success: false, error: error?.message || "Error adding student" },
      { status: 500 }
    );
  }
};
