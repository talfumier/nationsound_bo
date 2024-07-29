import http from "./httpService.js";
import {getApiUrl} from "./utilsFunctions.js";
import config from "../config.json";

const api = getApiUrl();

export function getAllContainers(signal) {
  return http.get(`${api}/files`, {signal});
}
export function getContainerById(id, signal) {
  return http.get(`${api}/files/${id}`, {signal});
}
export function postContainer(data, token, signal) {
  return http.post(`${api}/files`, data, {
    headers: {"x-auth-token": token},
    signal,
  });
}
export function postInCloud(publicId, data, token, signal) {
  return http.post(
    `${api}/files/cloudinary-upload-base64`,
    {publicId, data},
    {
      headers: {"x-auth-token": token},
      signal,
    }
  );
}
export function updateContainer(id, data, token, signal) {
  return http.put(`${api}/files/${id}`, data, {
    headers: {"x-auth-token": token},
    signal,
  });
}
export function deleteContainer(id, token, signal) {
  return http.delete(`${api}/files/${id}`, {
    headers: {"x-auth-token": token},
    signal,
  });
}
export function deleteImage(id, idx, token, signal) {
  return http.delete(`${api}/files/${id}/${idx}`, {
    headers: {"x-auth-token": token},
    signal,
  });
}
