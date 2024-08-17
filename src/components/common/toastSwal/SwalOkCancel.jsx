import swal from "sweetalert";
import "./swal.css";
export async function SwalOkCancel(msg1, msg2) {
  let text = msg1;
  if (msg2) text = `${text}\n\n${msg2}`;
  const confirm = (await swal({
    text,
    icon: "warning", //info,error,success
    buttons: ["Annuler", "Ok"],
    closeOnClickOutside: false,
    dangerMode: true,
  }))
    ? true
    : false;
  if (!confirm) return "cancel";
  return "ok";
}
export async function SwalOk(msg1, msg2) {
  let text = msg1;
  if (msg2) text = `${text}\n\n${msg2}`;
  const confirm = (await swal({
    text,
    icon: "warning", //info,error,success
    buttons: "Ok",
    closeOnClickOutside: false,
    dangerMode: true,
  }))
    ? true
    : false;
  return "ok";
}
