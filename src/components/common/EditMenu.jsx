import {NavLink} from "react-router-dom";
import {SwalOkCancel} from "./toastSwal/SwalOkCancel.jsx";
import {getFormattedDate} from "./utilityFunctions.js";

function EditMenu({url, data: dataIn, onHandleDelete}) {
  const {data, len, comboData} = dataIn;
  return (
    <div className="edit-menu-container">
      {data.active && (
        <>
          <div className="date">{`Mis à jour : ${getFormattedDate(
            data.updatedAt
          )}`}</div>
          <div className="edit-menu">
            <NavLink
              to={{pathname: `${url}/${data.id}`}}
              state={{data, len, comboData}}
            >
              <i className="fa-solid fa-pencil fa-1x"></i>
              <span>Modifier</span>
            </NavLink>
            <NavLink
              onClick={async () => {
                const result = await SwalOkCancel(
                  "Merci de confirmer la suppression définitive !"
                );
                if (result === "cancel") return;
                onHandleDelete();
              }}
            >
              <i className="fa-solid fa-trash fa-1x"></i>
              <span>Supprimer</span>
            </NavLink>
          </div>
        </>
      )}
    </div>
  );
}
export default EditMenu;
