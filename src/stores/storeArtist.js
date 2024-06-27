import {create} from "zustand";
import {getAllArtists} from "../services/httpArtists.js";

const useArtist = create((set, get) => ({
  artists: [],
  len: 0,
  loadData: async (signal) => {
    try {
      const {data: res} = await getAllArtists(null, signal);
      set(() => ({
        artists: res.data,
        len: res.data.length,
      }));
    } catch (error) {} //error handling in httpService.js
  },
}));
export default useArtist;
