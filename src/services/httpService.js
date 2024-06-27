import axios from "axios";
import {translate} from "./httpGoogleServices.js";
import {toastError} from "../components/common/toastSwal/ToastMessages.js";

axios.interceptors.response.use(
  async (response) => {
    //catching successful response from API (200 status) returning BadRequest, Unauthorized... custom expected 'errors'
    if (response.data.statusCode >= 400 && response.data.statusCode < 500) {
      toastError(
        await translate({
          text: `${response.data.description}: ${response.data.message}`, //message sent back from API customErrors.js such as BadRequest, NotFound ...
          to: "fr",
        })
      );
      return Promise.reject("expected error returned from API");
    }
    return Promise.resolve(response);
  },
  async (error) => {
    //catching unexpected errors globally
    // https://www.dhiwise.com/post/common-axios-network-errors-and-how-to-solve-the
    let text = "";
    if (!error.response) text = "réseau ou connection indisponible.";
    //no response means network error
    else {
      const expectedErr =
        error.response.status >= 400 && error.response.status < 500;
      if (!expectedErr && error.message && error.message !== "canceled") {
        //canceled error coming from aborted data loading operations in order to avoid memory leak, no need to send alert message to the user
        text = await translate({
          text: error.message,
          to: "fr",
        });
      }
    }
    toastError("Une erreur inattendue est survenue > " + text);
    return Promise.reject(error);
  }
);
export default {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  patch: axios.patch,
  delete: axios.delete,
};
