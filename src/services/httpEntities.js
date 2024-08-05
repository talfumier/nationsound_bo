import http from "./httpService.js";
import {getApiUrl} from "./utilsFunctions.js";

const api = getApiUrl();

function getRouteElement(str) {
  return str === "account" ? "user" : str;
}
export function getEntities(entity, token, signal) {
  return http.get(`${api}/entities/${getRouteElement(entity)}`, {
    headers: {"x-auth-token": token},
    signal,
  });
}
export function getEntity(entity, token, id, signal) {
  return http.get(`${api}/entities/${getRouteElement(entity)}/${id}`, {
    headers: {"x-auth-token": token},
    signal,
  });
}
export function patchEntity(entity, id, data, token, signal) {
  return http.patch(`${api}/entities/${getRouteElement(entity)}/${id}`, data, {
    headers: {"x-auth-token": token},
    signal,
  });
}
export function postEntity(entity, data, token, signal) {
  return http.post(`${api}/entities/${getRouteElement(entity)}`, data, {
    headers: {"x-auth-token": token},
    signal,
  });
}
export function deleteEntity(entity, id, token, signal) {
  return http.delete(`${api}/entities/${getRouteElement(entity)}/${id}`, {
    headers: {"x-auth-token": token},
    signal,
  });
}
