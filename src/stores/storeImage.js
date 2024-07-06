import {create} from "zustand";
import _ from "lodash";
import {
  getAllContainers,
  postImage,
  deleteImage,
  getContainerById,
  updateContainer,
  deleteContainer,
  postContainer,
} from "../services/httpImages.jsx";
import {translate} from "../services/httpGoogleServices.js";
import {toastSuccess} from "../components/common/toastSwal/ToastMessages.js";
import {getEmptyImage} from "../components/common/utilityFunctions.jsx";

const useImage = create((set, get) => ({
  containers: [],
  loadAll: async (signal) => {
    try {
      const {data: res} = await getAllContainers(signal);
      set(() => ({
        containers: res.data,
      }));
    } catch (error) {} //error handling in httpService.js
  },
  loadById: async (id, signal) => {
    try {
      if (!id) return;
      const conts = get().containers;
      const cont = _.filter(conts, (item) => {
        return item._id === id;
      })[0];
      if (cont) return cont; //image container already loaded
      const {data: res} = await getContainerById(id, signal);
      do {
        res.data.images.push(getEmptyImage());
      } while (res.data.images.length < 3);
      conts.push(res.data);
      set(() => ({
        containers: conts,
      }));
      return res.data;
    } catch (error) {} //error handling in httpService.js
  },
  create: async (data, signal, msg = true) => {
    try {
      const {data: res} = await postContainer(data, null, signal);
      const conts = get().containers;
      conts.push(res.data);
      set(() => ({
        containers: conts,
      }));
      if (msg)
        toastSuccess(
          await translate({
            text: `${res.message}`,
            to: "fr",
          })
        );
      return res.data;
    } catch (error) {} //actual expected and unexpected error handling in httpService.js
  },
  update: async (id, data, signal, msg = true) => {
    try {
      const {data: res} = await updateContainer(id, data, null, signal);
      const conts = _.filter(get().containers, (item) => {
        return item._id !== id;
      });
      conts.push(res.data);
      set(() => ({
        containers: conts,
      }));
      if (msg)
        toastSuccess(
          await translate({
            text: `${res.message}`,
            to: "fr",
          })
        );
    } catch (error) {} //actual expected and unexpected error handling in httpService.js
  },
  addRemove: async (cs = "add", id, idx = null, data, signal, msg = true) => {
    // id > artist.id | partner.id
    try {
      const {data: res} =
        cs === "add"
          ? await postImage(id, data, null, signal)
          : await deleteImage(id, idx, null, signal);
      const conts = _.filter(get().containers, (item) => {
        return item._id !== id;
      });
      set(() => ({
        containers: [...conts, ...res.data],
      }));
      if (msg)
        toastSuccess(
          await translate({
            text: `${res.message}`,
            to: "fr",
          })
        );
      return res.data;
    } catch (error) {
      console.log(error);
    } //actual expected and unexpected error handling in httpService.js
  },

  delete: async (id, signal) => {
    try {
      await deleteContainer(id, null, signal);
      const conts = _.filter(get().containers, (item) => {
        return item._id !== id;
      });
      set(() => ({
        containers: conts,
      }));
    } catch (error) {} //actual expected and unexpected error handling in httpService.js
  },
}));
export default useImage;
