import http from "./httpService";
import {getApiUrl} from "./utilsFunctions.js";

const api = getApiUrl();
export function getAllArtists(token, signal) {
  return http.get(`${api}/artists`, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
export function getArtistById(id, token, signal) {
  return http.get(`${api}/artists/${id}`, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
export function patchArtist(id, data, token, signal) {
  return http.patch(`${api}/artists/${id}`, data, {
    // headers: {"x-auth-token": token},
    signal,
  });
}
