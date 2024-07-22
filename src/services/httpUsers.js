import http from "./httpService";
import {jwtDecode} from "jwt-decode";
import {getApiUrl} from "./utilsFunctions.js";

const api = getApiUrl();
export function login(email, pwd) {
  return http.post(`${api}/login`, {email, pwd});
}
export function register(email, role, pwd) {
  return http.post(`${api}/register`, {
    email,
    role,
    pwd,
  });
}
export function forgotPassword(url, email) {
  return http.post(`${api}/resetpassword/forgotPassword`, {url, email});
}
export function resetPassword(id, resetToken, pwd) {
  return http.patch(`${api}/resetpassword/forgotPassword/${id}/${resetToken}`, {
    pwd,
  });
}
export function decodeJWT(jwt) {
  try {
    return jwtDecode(jwt);
  } catch (error) {}
  return null;
}
