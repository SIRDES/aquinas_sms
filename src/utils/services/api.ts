"use server";

import axios from "axios";
const { ARKESEL_SMS_API_KEY, BASE_URL, NPOINTU_UID, NPOINTU_PASS } = process.env;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});



export const checkMessageStatus = async ({ sms_id }: { sms_id: string }) => {
  try {
    let headersList = {
      "api-key": ARKESEL_SMS_API_KEY as string,
      "Content-Type": "application/json",
    };
    let reqOptions = {
      url: `https://sms.arkesel.com/api/v2/sms/${sms_id}`,
      method: "GET",
      headers: headersList,
    };
    let response = await axios.request(reqOptions);
    console.log("sendMessage ok res", response.data);
    return response.data;
  } catch (error: any) {
    console.log("checkMessagestatus error res", error);
    console.log("checkMessagestatus error res data", error.response.data);
    return error.response.data;
  }
};

export const makePayment = async ({
  number,
  transactionId,
  vendor,
  shortDescription,
  amount,
  paymentCallback,
}: {
  number: string;
  transactionId: string;
  vendor: "MTN" | "Airtel" | "Vodafone" | "Tigo";
  shortDescription: string;
  amount: string;
  paymentCallback?: string;
}) => {
  const msg = "Aquinas SHS friday test"; // Replace with your actual message
  let callback = `${BASE_URL}/api/payment-callback`;
  if (paymentCallback) {
    callback = paymentCallback;
  }
  // const amt = "5.00";

  const requestBody = {
    number,
    vendor,
    uid: NPOINTU_UID,
    pass: NPOINTU_PASS,
    tp: transactionId,
    cbk: callback,
    // amt: "1.00",
    amt: amount,
    msg: shortDescription,
    trans_type: "debit",
  };

  // console.log("requestBody", requestBody);
  try {
    const response = await axios.post(
      "https://pay.npontu.com/api/pay",
      requestBody,
      { timeout: 3000 }
    );
    // console.log("make payement req response.data", response.data);
    return response;
  } catch (error) {
    console.error("Error making payment:", error);
  }
};
