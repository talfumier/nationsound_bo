import {toast} from "react-toastify";

function style(msg) {
  return <div className="toast-message">{msg}</div>;
}
export function toastSuccess(msg) {
  return toast.success(style(msg), {
    progressClassName: "error-progress-bar",
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}
export function toastWarning(msg) {
  return toast.warning(style(msg), {
    progressClassName: "error-progress-bar",
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}
export function toastError(msg) {
  return toast.error(style(msg), {
    progressClassName: "error-progress-bar",
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}
export function toastInfo(msg) {
  return toast.info(style(msg), {
    progressClassName: "error-progress-bar",
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
}
