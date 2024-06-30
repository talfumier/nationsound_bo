import {create} from "zustand";
import _ from "lodash";
import {
  getAllArtists,
  postArtist,
  patchArtist,
  deleteArtist,
} from "../services/httpArtists.js";
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
        artists: _.orderBy(res.data, ["name"], ["asc"]),
        len: res.data.length,
      }));
    } catch (error) {} //error handling in httpService.js
  },
  create: async (data, signal) => {
    try {
      const {data: res} = await postArtist(data, null, signal);
      const artists = get().artists;
      artists.push(res.data);
      set(() => ({
        artists: _.orderBy([...artists], ["name"], ["asc"]),
        len: get().len + 1,
      }));
      toastSuccess(
        await translate({
          text: `${res.message}`,
          to: "fr",
        })
      );
    } catch (error) {} //actual expected and unexpected error handling in httpService.js
  },
  update: async (id, data, signal) => {
    try {
      const {data: res} = await patchArtist(id, data, null, signal);
      const artists = get().artists;
      const idx = artists.findIndex((artist) => artist.id == id);
      artists[idx] = res.data;
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
  delete: async (id, signal) => {
    try {
      const {data: res} = await deleteArtist(id, null, signal);
      const artists = get().artists;
      const idx = artists.findIndex((artist) => artist.id == id);
      artists.splice(idx, 1);
      set(() => ({
        artists: [...artists],
        len: get().len - 1,
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
