"use server";
import { connectDB } from "@/lib/mongodb";
import VotingUssdSession from "@/models/VotingUssdSession";

export const AddVotingUssdSession = async (ussdSession: {
  sessionId: string;
  msisdn: string;
  data: string;
  network: string;
}) => {
  await connectDB();
  return VotingUssdSession.create(ussdSession);
};

export const getVotingUssdSession = async (sessionId: string) => {
  await connectDB();
  return VotingUssdSession.findOne({ sessionId }).lean();
};

export const updateVotingUssdSession = async ({
  sessionId,
  data,
}: {
  sessionId: string;
  data: any;
}) => {
  await connectDB();
  return VotingUssdSession.updateOne({ sessionId }, { $set: data }).lean();
};
export const deleteVotingUssdSession = async (sessionId: string) => {
  await connectDB();
  return VotingUssdSession.deleteOne({ sessionId });
};
