// import axios from "axios";
import SMSResult from "@/models/SMSResult";
// import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";



export const POST = async (request: NextRequest) => {
  console.log("sms callback response POST");
  // console.log("request", request)
  console.log("request url", request.url)
  console.log("request headers", request.headers)
  console.log("request body", request.body)
  // console.log("request query", request.query)
  const requestBody = await request.json();
  console.log("requestBody", requestBody);
  try {
    if (requestBody) {
      const result = await SMSResult.findOneAndUpdate(
        { sms_id: requestBody.sms_id },
        { status: requestBody.status },
        { new: true, upsert: true }
      );
    }
    return new NextResponse("", { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse("API responsed with error", { status: 500 });
  }
};



export const GET = async (request: NextRequest) => {
  console.log("sms callback response");
  // console.log("request", request)
  console.log("request url", request.url)
  console.log("request headers", request.headers)
  console.log("request body", request.body)
  // console.log("request query", request.query)
  const searchParams = new URLSearchParams(new URL(request.url).searchParams);
  const sms_id = searchParams.get("sms_id");
  const status = searchParams.get("status");
  console.log("query parameters", sms_id, status);
  try {
    if (sms_id && status) {
      console.log("sms_id", sms_id);
      console.log("status", status);
      await connectDB();
      const result = await SMSResult.findOneAndUpdate(
        { sms_id: sms_id },
        { status: status },
      );
    }
    return new NextResponse("", { status: 200 });
  } catch (error: any) {
    console.log(error);
    return new NextResponse("API responsed with error", { status: 500 });
  }
};
