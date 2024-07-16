import {NavLink, useLocation} from "react-router-dom";
import BackButton from "./BackButton.jsx";

function PageHeader({title, len, url, data}) {
  const location = useLocation();

  const cond = () => {
    const path = url ? url : location.pathname;
    if (path.length === 0) return false;
    if (path.split("/").length >= 3) return false;
    if (
      path.includes("dates") ||
      path.includes("maps") ||
      path.includes("logos")
    )
      return len === 0;
    return true;
  };
  return (
    <div className="page-header">
      <BackButton></BackButton>
      <h2>
        {title}
        <span>{len}</span>
      </h2>
      {cond() && (
        <NavLink
          className="btn btn-info"
          to={{pathname: location.pathname + "/-1"}}
          state={{comboData: data, len: len + 1}}
        >
          <i className="fa-solid fa-plus fa-1x"></i>
          <span>Ajouter</span>
        </NavLink>
      )}
    </div>
  );
}

export default PageHeader;
