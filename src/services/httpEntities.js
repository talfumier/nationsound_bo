import http from "./httpService";
import {getApiUrl} from "./utilsFunctions.js";

const api = getApiUrl();
export function getEntities(entity, token, signal) {
  return http.get(`${api}/entities/${entity}`, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
export function getEntity(entity, id, token, signal) {
  return http.get(`${api}/entities/${entity}/${id}`, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
export function patchEntity(entity, id, data, token, signal) {
  return http.patch(`${api}/entities/${entity}/${id}`, data, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
export function postEntity(entity, data, token, signal) {
  return http.post(`${api}/entities/${entity}`, data, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
export function deleteEntity(entity, id, token, signal) {
  return http.delete(`${api}/entities/${entity}/${id}`, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
