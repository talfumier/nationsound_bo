import {create} from "zustand";
import _ from "lodash";
import {getAllArtists, patchArtist} from "../services/httpArtists.js";
import {translate} from "../services/httpGoogleServices.js";
import {toastSuccess} from "../components/common/toastSwal/ToastMessages.js";

const useArtist = create((set, get) => ({
  artists: [],
  len: 0,
  selected: {},
  load: async (signal) => {
    try {
      const {data: res} = await getAllArtists(null, signal);
      set(() => ({
        artists: _.orderBy(res.data, ["id", "name"], ["asc"]),
        len: res.data.length,
      }));
    } catch (error) {} //error handling in httpService.js
  },
  update: async (id, data, signal) => {
    try {
      const {data: res} = await patchArtist(id, data, null, signal);
      const artists = get().artists;
      const idx = artists.findIndex((artist) => artist.id == id);
      artists[idx] = {...artists[idx], ...data};
      set(() => ({
        artists: [...artists],
      }));
      toastSuccess(
        await translate({
          text: `${res.message}`,
          to: "fr",
        })
      );
    } catch (error) {} //actual expected and unexpected error handling in httpService.js
  },
  select: (id, ckd) => {
    const obj = {...reset(get().artists), [id]: ckd};
    set(() => ({
      selected: obj,
    }));
  },
}));
function reset(artists) {
  const obj = {};
  artists.map((artist) => {
    obj[artist.id] = false;
  });
  return obj;
}
export default useArtist;
