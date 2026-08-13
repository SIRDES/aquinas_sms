"use server";
import { connectDB } from "@/lib/mongodb";
import UssdSession, { IUssdSession } from "@/models/UssdSession";

export const AddUssdSession = async (ussdSession: {
  sessionId: string;
  msisdn: string;
  data: string;
  network: string;
}) => {
  await connectDB();
  return UssdSession.create(ussdSession);
};

export const getUssdSession = async (sessionId: string) => {
  await connectDB();
  return UssdSession.findOne({ sessionId }).lean();
};

export const updateUssdSession = async ({
  sessionId,
  data,
}: {
  sessionId: string;
  data: any;
}) => {
  await connectDB();
  return UssdSession.updateOne({ sessionId }, { $set: data }).lean();
};
export const deleteUssdSession = async (sessionId: string) => {
  await connectDB();
  return UssdSession.deleteOne({ sessionId });
};
