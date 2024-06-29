import {NavLink} from "react-router-dom";

function EditMenu({id, url, visible}) {
  return (
    <div className="edit-menu-container">
      {visible && (
        <div className="edit-menu">
          <NavLink to={{pathname: `${url}/${id}`}}>
            <i className="fa-solid fa-pencil fa-1x"></i>
            <span>Modifier</span>
          </NavLink>
          <NavLink>
            <i className="fa-solid fa-trash fa-1x"></i>
            <span>Supprimer</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}
export default EditMenu;
