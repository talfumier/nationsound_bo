import {useNavigate, NavLink, useLocation} from "react-router-dom";
import {Tooltip} from "react-tooltip";

function PageHeader({title, len, url, data}) {
  const location = useLocation();
  const navigate = useNavigate();

  const cond = () => {
    const path = url ? url : location.pathname;
    if (path.length === 0) return false;
    if (path.split("/").length >= 3) return false;
    if (path.includes("dates")) return len === 0;
    return true;
  };
  return (
    <div className="page-header">
      <a className="tooltip-anchor-back">
        <Tooltip
          className="toolbar-button tooltip"
          anchorSelect=".tooltip-anchor-back"
          place="bottom"
          variant="info"
          content="Retour page précédente."
        />
        <button
          className="back-button"
          onClick={() => {
            navigate(-1);
          }}
        >
          <i className="fa-solid fa-arrow-left fa-3x"></i>
        </button>
      </a>
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
