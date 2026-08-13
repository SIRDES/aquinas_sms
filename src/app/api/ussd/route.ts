import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Menu from "@/utils/ussdMenu";
import {
  getStudentByNumber,
  getStudentResultsWithPaymentId,
} from "@/utils/serverActions/student";
import {
  AddUssdSession,
  deleteUssdSession,
  getUssdSession,
  updateUssdSession,
} from "@/utils/serverActions/ussdSession";

import { checkPaymentMadeForStudent } from "@/utils/serverActions/paymentTransaction";
import { axiosInstance } from "@/utils/services/api";


type SessionData = {
  _id: string;
  sessionId: string;
  msisdn: string;
  data: string;
  network: string;
  to?: string;
  mainStage?: string;
  stage?: string;
  selectedWeek?: string;
  selectedWeekId?: string;
  examType?: string;
  studentNumber?: string;
  numberOfPaymentCodeRetries: number;
  numberOfStudentNumberRetries: number;
  studentName?: string;
  studentId?: string;
  parentPhoneNumber?: string;
  paymentShortDescription?: string;
  payementTransactionId?: string;
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
  // console.log("Raw Form Data:", formData);

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

  // console.log({ msisdn, sequenceID, data, network });

  const timestamp = formatDate(new Date());
  const cont = 0;
  const end = 1;
  let session: SessionData;
  const ussdSession = await getUssdSession(sequenceID);
  if (ussdSession) {
    session = ussdSession;
  } else {
    const newUssdSession = await AddUssdSession({
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
  await connectDB();

  try {
    if (data === "*899*889" || data === "*899*889#" || data === "899*889") {
      response.message = "Service is not available at the moment";
      response.continueFlag = end;
      // response.message = Menu.MainMenu();
      // response.continueFlag = cont;
      session.stage = "MainMenu";

    }
    // else if (data === "1" && session.stage === "MainMenu") {
    //   response.message = Menu.EnterStudentId();
    //   response.continueFlag = cont;
    //   session.mainStage = "FridayTest";
    //   session.stage = "EnterStudentId";
    // }
    else if (data === "1" && session.stage === "MainMenu") {
      response.message = Menu.EnterStudentId();
      response.continueFlag = cont;
      session.mainStage = "FormOneSemesterExams";
      session.stage = "EnterStudentId";
    }
    // else if (data === "2" && session.stage === "MainMenu") {
    //   response.message = `Invalid input\n${Menu.MainMenu()}`;
    //   response.continueFlag = cont;
    //   session.stage = "MainMenu";
    // }
    else if (data === "2" && session.stage === "MainMenu") {
      response.message = Menu.EnterStudentId();
      response.continueFlag = cont;
      session.mainStage = "FormTwoSemesterExams";
      session.stage = "EnterStudentId";
    }
    else if (data === "3" && session.stage === "MainMenu") {
      response.message = Menu.EnterStudentId();
      response.continueFlag = cont;
      session.mainStage = "FormThreeSemesterExams";
      session.stage = "EnterStudentId";
    }
    else if (session.stage === "EnterStudentId") {
      if (session.numberOfStudentNumberRetries >= 3) {
        response.message = "Too many retries.\r\n" + Menu.MenuSupportAssist();
        response.continueFlag = end;
        // session.stage = "ContactMenu";
      } else {
        const studentNumber = data;
        session.studentNumber = studentNumber;
        let yearGroup = "2025";
        if (session.mainStage === "FormOneSemesterExams") {
          yearGroup = "2027";
        }
        if (session.mainStage === "FormTwoSemesterExams") {
          yearGroup = "2026";
        }

        const responseData = await getStudentByNumber({
          studentNumber,
          yearGroup,
        });
        session.numberOfStudentNumberRetries += 1;

        if (!responseData.data) {
          response.message = "Invalid student number. Try again.";
          session.stage = "EnterStudentId";
          response.continueFlag = cont;
        } else {
          response.message = Menu.FormThreeSemesterSelect();
          if (session.mainStage === "FormOneSemesterExams") {
            response.message = Menu.SemesterSelect("1");
          }
          if (session.mainStage === "FormTwoSemesterExams") {
            response.message = Menu.FormTwoSemesterSelect();
          }

          response.continueFlag = cont;
          session.studentId = responseData?.data?._id;
          session.studentName = `${responseData?.data?.firstName ? responseData?.data?.firstName + " " : ""} ${responseData?.data?.lastName ? responseData?.data?.lastName : ""}`;
          session.parentPhoneNumber = responseData?.data?.parentPhoneNumber;
          session.stage = "FridayTestSelectWeekMenu";
          session.to = "EnterStudentId";
        }
      }
    } else if (session.stage === "FridayTestSelectWeekMenu") {
      let selectedExamType = "friday_test";
      if (session.mainStage === "FormOneSemesterExams" || session.mainStage === "FormTwoSemesterExams") {
        selectedExamType = "semester_exams"
      }

      if (session.mainStage === "FormThreeSemesterExams" && data === "1") {
        selectedExamType = "semester_exams"
      }


      let weeks: {
        "1": { name: string; id: string };
        "2"?: { name: string; id: string };
      };

      weeks = {
        "1": { name: "Form 3 semester 1", id: "685da5a4c12f53d69e7e2d46" },
        // "2": { name: "2nd week", id: "67b12164f39380be891298bf" }
      }
      if (session.mainStage === "FormOneSemesterExams") {
        weeks = {
          "1": { name: "Form 1 semester 1", id: "685ace13197e15164c744f07" }
        }
      }
      if (session.mainStage === "FormTwoSemesterExams") {
        weeks = {
          "1": { name: "Form 1 semester 2", id: "67f1cefc03abaeaa86d1f01e" },
          "2": { name: "Form 2 semester 1", id: "6890e4379d3b7ba44fcab0d9" }
        }
      }
      if (session.mainStage === "FormOneSemesterExams" && data !== "1") {
        response.message = `Invalid input\r\n${Menu.SemesterSelect("1")}`
        response.continueFlag = cont;
        session.stage = "FridayTestSelectWeekMenu";
        session.to = "EnterStudentId";
      }
      if (session.mainStage === "FormTwoSemesterExams" && data !== "1") {
        response.message = `Invalid input\r\n${Menu.FormTwoSemesterSelect()}`
        response.continueFlag = cont;
        session.stage = "FridayTestSelectWeekMenu";
        session.to = "EnterStudentId";
      }
      if ((session.mainStage === "FormThreeSemesterExams") && data !== "1") {
        response.message = `Invalid input\r\n${Menu.FormThreeSemesterSelect()}`
        response.continueFlag = cont;
        session.stage = "FridayTestSelectWeekMenu";
        session.to = "EnterStudentId";
      }

      else {
        const selectedWeekObj = weeks[data as "1" | "2"];
        let selectedWeek = selectedWeekObj?.name as string;
        let selectedWeekId = selectedWeekObj?.id as string;
        session.selectedWeek = selectedWeek;
        session.selectedWeekId = selectedWeekId;
        session.examType = selectedExamType;
        const responseData = await checkPaymentMadeForStudent({
          studentId: session.studentId as string,
          batchId: session.selectedWeekId,
          examType: session.examType,
          status: "Succcess",
        });
        if (
          responseData?.success &&
          responseData?.data &&
          responseData.data.numberOfTimesUsed <= 2
        ) {
          response.message = `You'll receive the result for ${session.studentName} for ${session.selectedWeek} via sms.\r\n1. Continue`;
          response.continueFlag = cont;

          session.payementTransactionId = responseData?.data?._id as string;
          session.stage = "HasPaidForThisExam";
        } else {
          response.message = `You're required to make a payment of GHC ${session.examType === "semester_exams" ? 10 : 5} to receive the result.\r\n1. Continue`;
          session.stage = "ContinuePayment";
          session.paymentShortDescription = `Aquinas SHS`;
          session.to = undefined;
          response.continueFlag = cont;
        }
      }
    }
    else if (data === "1" && session.stage === "HasPaidForThisExam") {
      response.message = `You'll receive the result via sms shortly. Thank you.`;
      response.continueFlag = end;
      await getStudentResultsWithPaymentId({
        transaction_id: session.payementTransactionId as string,
        updateNumberOfTimesUsed: true,
        sessionMsisdn: `+${msisdn}`
      });
    }
    else if (data === "1" && session.stage === "ContinuePayment") {
      response.message = `${session.examType === "semester_exams" ? "Exams" : "Week"}: ${session.selectedWeek}.\r\nStudent: ${session.studentName}.\r\n1. Confirm\r\n0. Back\r\n`;
      // response.message = `${session.examType === "semester_exams" ? "Exams" : "Week"}: ${session.selectedWeek}.\r\nStudent: ${session.studentName}\r\nParent/Guardian Phone: ${session.parentPhoneNumber}.\r\n1. Confirm\r\n0. Back\r\n`;
      session.stage = "ConfirmPayment";
      response.continueFlag = cont;
      session.to = "EnterStudentId";
    } else if (data === "1" && session.stage === "ConfirmPayment") {
      const res = await axiosInstance.post(`/api/make-payment`, {
        msisdn,
        studentId: session.studentId,
        batchId: session.selectedWeekId,
        examType: session.examType,
        network,
        amount: session.examType === "semester_exams" ? "10.00" : "10.00",
        shortDescription: session.paymentShortDescription
      });
      if (res.data.success) {
        response.message = `You'll receive a prompt shortly to authorize your payment.If it delays dial ${network === "mtn" ? "*170#" : "*110#"}\r\nThank you.`;
      } else {
        response.message = res.data.message;
      }
      response.continueFlag = end;
    } else if (data === "7") {
      response.message = Menu.ContactMenu();
      response.continueFlag = end;
    } else if (data === "0") {
      if (session.to) {
        const to = session.to;
        response.message = (Menu as any)[to]();
        response.continueFlag = cont;
        session.stage = to;
      } else {
        response.message = "Thank you for working with us";
        response.continueFlag = end;
      }
    } else {
      response.message =
        "Sorry Unable to complete request\r\n" + Menu.MenuSupportAssist();
      response.continueFlag = end;
    }

    // Handle other cases...
  } catch (error) {
    // console.error(error);
    response.message = "An error occurred. Please try again.";
    response.continueFlag = end;
  }
  if (response.continueFlag === cont) {
    await updateUssdSession({ sessionId: sequenceID, data: session });
  } else {
    await deleteUssdSession(sequenceID);
  }
  // NextResponse.json({ response });
  return NextResponse.json(response);
};
