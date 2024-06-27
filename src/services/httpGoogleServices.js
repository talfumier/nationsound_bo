import http from "./httpService";
import {getApiUrl} from "./utilsFunctions.js";

const api = getApiUrl();
export async function translate(data) {
  //data is an object >>> {text, from, to}
  try {
    const res = await http.post(`${api}/translate`, data);
    return res.data;
  } catch (error) {
    return data.text; //return non translated text in case of error
  }
}
