import axios, { isCancel, AxiosError } from "axios";

interface Params {
  hueline_id: string;
  domain_id: string;
  slug: string;
  call_sid: string;
}

const url = process.env.LAMBDA_CALL_INTELLIGENCE || ""

export async function getCallIntelligence(params: Params) {

  
  try {
    const response = await axios.post(url, params);
    return response.data;
  } catch (error) {
    console.error("Call Intelligence Error:", error);
    throw error;
  }
}