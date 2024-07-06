import http from "./httpService";
import {getApiUrl} from "./utilsFunctions.js";

const api = getApiUrl();

export function getAllContainers(signal) {
  return http.get(`${api}/images`, {signal});
}
export function getContainerById(id, signal) {
  return http.get(`${api}/images/${id}`, {signal});
}
export function postImage(id, data, token, signal) {
  return http.post(`${api}/images/${id}`, data, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
export function postContainer(data, token, signal) {
  return http.post(`${api}/images`, data, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
export function updateContainer(id, data, token, signal) {
  return http.patch(`${api}/images/${id}`, data, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
export function deleteContainer(id, token, signal) {
  return http.delete(`${api}/images/${id}`, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
export function deleteImage(id, idx, token, signal) {
  return http.delete(`${api}/images/${id}/${idx}`, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
