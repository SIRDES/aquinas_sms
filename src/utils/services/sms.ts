"use server";
import axios, { AxiosRequestConfig } from "axios";
import { getAdminSetting } from "../serverActions/adminSettings";
import { addSMSResult } from "../serverActions/smsResult";

const API_URL = "https://sms.arkesel.com/api/v2/sms/template/send";
const API_KEY = process.env.ARKESEL_SMS_API_KEY as string; // Replace with your actual API key
const MNOTIFY_API_KEY = process.env.MNOTIFY_API_KEY as string;
const SMS_SENDER = "AQUINAS SHS";
// Define TypeScript interfaces for structured typing
interface SmsPayload {
  message: string;
  recipients: any[];
  callback_url?: string;
}

const headers = {
  "api-key": API_KEY,
  // "Content-Type": "application/json",
};



// Function to send SMS
const sendSms = async (body: SmsPayload) => {
  const data = {
    sender: SMS_SENDER,
    message: body.message,
    recipients: body.recipients,
    callback_url: `https://cb93-154-161-24-201.ngrok-free.app/api/sms-callback`,
    // callback_url: `${process.env.NEXT_PUBLIC_ARKESEL_SMS_CALLBACK_BASE_URL}/api/sms-callback`,
  };

  const config: AxiosRequestConfig = {
    method: "post",
    url: "https://sms.arkesel.com/api/v2/sms/send",
    headers,
    data,
  };


  const naloData = {
    // username: "AquinasSHS",
    // password: "[PASSWORD]",
    key: ")wcav5guzevjl)0)1w3gh(ehg2d4x0(#ih7jkmk2gpi987)6530xadkyjxlgzi",
    msisdn: body.recipients.join(","),
    message: body.message,
    sender_id: SMS_SENDER
  };

  const naloConfig: AxiosRequestConfig = {
    method: "post",
    url: "https://sms.nalosolutions.com/smsbackend/Resl_Nalo/send-message/",
    // headers: {
    //   Accept: "application/json",
    // },
    data: JSON.stringify(naloData),
  };

  const mnofityData = {
    recipient: body.recipients,
    sender: SMS_SENDER,
    message: body.message,
    is_schedule: "false",
    schedule_date: "",
  };

  const mnotifyConfig: AxiosRequestConfig = {
    method: "post",
    url: "https://api.mnotify.com/api/sms/quick?key=" + MNOTIFY_API_KEY,
    headers: {
      Accept: "application/json",
    },
    data: mnofityData,
  };
  // console.log("config", config);
  try {
    const adminSettings = await getAdminSetting();
    // console.log("adminSettings", adminSettings);
    const smsProvider = adminSettings?.data?.smsProvider || "ARKESEL";
    let response;
    if (smsProvider === "MNOTIFY") {
      response = await axios(mnotifyConfig);
    } else if (smsProvider === "NALO") {
      response = await axios(naloConfig);
    } else {
      response = await axios(config);
    }

    if (response?.data?.status?.toLowerCase() === "success" || response?.data?.status === "1701") {
      await addSMSResult([
        {
          sms_id: smsProvider === "NALO" ? response?.data?.job_id || "" : response?.data?.data?.[0]?.id || "",
          smsProvider,
          phoneNumber: body.recipients[0],
          message: body.message,
          status: "pending",
        },
      ]);
    }
    // return "response.data";
    return response.data;
  } catch (error) {
    console.log("Error:", error);
    return error;
  }
};

const sendTemplateSms = async (body: SmsPayload) => {
  const data = {
    sender: SMS_SENDER,
    message: body.message,
    recipients: body.recipients,
  };

  const config: AxiosRequestConfig = {
    method: "post",
    url: "https://sms.arkesel.com/api/v2/sms/template/send",
    headers,
    data: data,
  };

  try {
    const response = await axios(config);
  } catch (error) {
    console.error("Error:", error);
  }
};

export const sendSMSWithCallbackUrl = async ({
  parentPhoneNumber,
  content,
  callback_url,
}: {
  parentPhoneNumber: string;
  content: string;
  callback_url: string;
}) => {
  try {
    // console.log("headersList", headersList);
    let bodyContent = JSON.stringify({
      sender: SMS_SENDER,
      message: content,
      recipients: parentPhoneNumber,
      callback_url: callback_url,
    });

    let reqOptions = {
      url: "https://sms.arkesel.com/api/v2/sms/send",
      method: "POST",
      headers,
      data: bodyContent,
    };
    let response = await axios.request(reqOptions);
    // console.log("sendMessage ok res", response.data);
    return response.data;
  } catch (error: any) {
    console.log("sendMessage error res", error);
    console.log("sendMessage error res data", error.response.data);
    return error?.response?.data;
  }
};

export const getBulkSmsStatus = async ({ msg_ids }: { msg_ids: string[] }) => {
  try {
    // console.log("headers", headers);
    const config = {
      method: "post",
      url: "https://sms.arkesel.com/api/v2/sms/message-reports",
      headers,
      data: {
        msg_ids,
      },
    };
    // console.log("config", config);
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export { sendSms, sendTemplateSms };
