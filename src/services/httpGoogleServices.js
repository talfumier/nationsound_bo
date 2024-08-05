import http from "./httpService.js";
import {getApiUrl} from "./utilsFunctions.js";

const api = getApiUrl();
export async function translate(data) {
  //data is an object >>> {text, from, to}
  try {
    const {data: res} = await http.post(`${api}/translate`, data);
    return res.text;
  } catch (error) {
    return data.text; //return non translated text in case of error
  }
}
