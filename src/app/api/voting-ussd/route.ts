import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import VotingMenu from "@/utils/votingUssdMenu";

import { axiosInstance } from "@/utils/services/api";
import { getAllElectionNomineeByElectionIdAndNomineeCode } from "@/utils/serverActions/electionNominee";
import {
  AddVotingUssdSession,
  getVotingUssdSession,
  updateVotingUssdSession,
  deleteVotingUssdSession,
} from "@/utils/serverActions/votingUssdSession";

type SessionData = {
  _id: string;
  sessionId: string;
  msisdn: string;
  data: string;
  network: string;
  to?: string;
  mainStage?: string;
  stage?: string;
  nomineeCode?: string;
  nomineeName?: string;
  nomineeId?: string;
  categoryId?: string;
  categoryName?: string;
  numberOfVotes?: number;
  amount?: number;
  paymentShortDescription?: string;
};

const formatDate = (date: Date): string => {
  return (
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2)
  );
};

export const POST = async (request: NextRequest) => {
  const formData = await request.formData(); // Parse form data

  const msisdn = formData.get("msisdn")?.toString();
  const sequenceID = formData.get("sequenceID")?.toString();
  const data = formData.get("data")?.toString();
  const network = formData.get("network")?.toString();

  if (!msisdn || !sequenceID || !data || !network) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const timestamp = formatDate(new Date());
  const cont = 0;
  const end = 1;
  let session: SessionData;
  const ussdSession = await getVotingUssdSession(sequenceID);
  if (ussdSession) {
    session = ussdSession;
  } else {
    const newUssdSession = await AddVotingUssdSession({
      sessionId: sequenceID,
      msisdn,
      network,
      data,
    });
    session = newUssdSession;
  }

  let response = {
    msisdn,
    sequenceID,
    timestamp,
    message: "",
    continueFlag: 1,
  };

  const electionId = "682678feda49f4e063b4ab28";
  const amntPerVote = 1;
  await connectDB();

  try {
    if (data === "*899*889" || data === "*899*889#" || data === "899*889") {
      response.message = VotingMenu.MainMenu();
      response.continueFlag = cont;
      session.stage = "MainMenu";
    } else if (data === "1" && session.stage === "MainMenu") {
      response.message = VotingMenu.EnterNomineeCode();
      response.continueFlag = cont;
      session.stage = "EnterNomineeCode";
    } else if (session.stage === "EnterNomineeCode") {
      // get nominee details
      session.nomineeCode = data;
      if (!data || data === "" || data.length <= 2) {
        response.message =
          "Invalid nominee code\r\n" + VotingMenu.EnterNomineeCode();
        response.continueFlag = cont;
        session.stage = "EnterNomineeCode";
      } else {
        const nomineeCode = data?.toLowerCase();
        const getNomineeresponse =
          await getAllElectionNomineeByElectionIdAndNomineeCode({
            electionId,
            nomineeCode,
          });

        if (!getNomineeresponse.success) {
          response.message =
            "Nominee not found\r\n" + VotingMenu.EnterNomineeCode();
          response.continueFlag = cont;
          session.stage = "EnterNomineeCode";
        } else {
          const nomineeData = getNomineeresponse.data;
          const nomineeId = nomineeData.nominee._id;
          const categoryId = nomineeData.category._id;
          const categoryName = nomineeData.category.name;
          const nomineeName =
            nomineeData.nominee.firstName + " " + nomineeData.nominee.lastName;
          session.nomineeId = nomineeId;
          session.categoryId = categoryId;
          session.nomineeName = nomineeName;
          session.categoryName = categoryName;

          response.message = VotingMenu.ConfirmNomineeDetails({
            nomineeName,
            categoryName,
          });
          response.continueFlag = cont;
          session.stage = "ConfirmNomineeDetails";
          session.to = "EnterNomineeCode";
        }
      }
    } else if (data === "1" && session.stage === "ConfirmNomineeDetails") {
      response.message = VotingMenu.EnterNumberOfVotes(amntPerVote);
      response.continueFlag = cont;
      session.stage = "EnterNumberOfVotes";
    } else if (session.stage === "EnterNumberOfVotes") {
      const numberOfVotes = Number(data);
      if (isNaN(numberOfVotes) || numberOfVotes <= 0) {
        response.message =
          "Invalid number of votes\r\n" +
          VotingMenu.EnterNumberOfVotes(amntPerVote);
        response.continueFlag = cont;
        session.stage = "EnterNumberOfVotes";
      } else {
        const amount = numberOfVotes * amntPerVote;
        session.numberOfVotes = numberOfVotes;
        session.amount = amount;
        response.message = VotingMenu.ConfirmNumberOfVotes({
          numberOfVotes,
          amount,
        });
        response.continueFlag = cont;
        session.stage = "ConfirmNumberOfVotes";
      }
    } else if (data === "1" && session.stage === "ConfirmNumberOfVotes") {
      const res = await axiosInstance.post(`/api/make-voting-payment`, {
        numberOfVotes: session.numberOfVotes,
        nomineeId: session.nomineeId,
        nomineeCode: session.nomineeCode,
        electionId,
        categoryId: session.categoryId,
        amount: session.amount,
        msisdn,
        network,
        shortDescription: "AQUINAS SRC AWARDS",
      });
      
      if (res.data.success) {
        response.message = `You'll receive a prompt shortly to authorize your payment.If it delays dial ${
          network === "mtn" ? "*170#" : "*110#"
        }\r\nThank you.`;
      } else {
        response.message = "Unable to complete request\r\n";
      }
      response.continueFlag = end;
    } else if (data === "7") {
      response.message = VotingMenu.ContactMenu();
      response.continueFlag = end;
    } else if (data === "0") {
      if (session.to) {
        const to = session.to;
        response.message = (VotingMenu as any)[to]();
        response.continueFlag = cont;
        session.stage = to;
      } else {
        response.message = "Thank you for working with us";
        response.continueFlag = end;
      }
    } else {
      response.message =
        "Sorry Unable to complete request\r\n" + VotingMenu.MenuSupportAssist();
      response.continueFlag = end;
    }

    // Handle other cases...
  } catch (error) {
    response.message = "An error occurred. Please try again.";
    response.continueFlag = end;
  }
  if (response.continueFlag === cont) {
    await updateVotingUssdSession({ sessionId: sequenceID, data: session });
  } else {
    await deleteVotingUssdSession(sequenceID);
  }
  return NextResponse.json(response);
};
