import {NavLink} from "react-router-dom";
import {SwalOkCancel} from "./toastSwal/SwalOkCancel.jsx";
import {getFormattedDate} from "./utilityFunctions.jsx";

function EditMenu({id, url, date, visible, onHandleDelete}) {
  return (
    <div className="edit-menu-container">
      {visible && (
        <>
          <div className="date">{`Mis à jour : ${getFormattedDate(date)}`}</div>
          <div className="edit-menu">
            <NavLink to={{pathname: `${url}/${id}`}}>
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
