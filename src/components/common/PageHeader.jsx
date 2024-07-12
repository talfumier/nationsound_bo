import {useNavigate, NavLink} from "react-router-dom";
import {Tooltip} from "react-tooltip";

function PageHeader({title, len, url}) {
  const navigate = useNavigate();
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
      {url && url.includes("dates")
        ? len === 0
        : true && (
            <NavLink
              className="btn btn-info"
              to={{pathname: `${url}/-1`}}
              state={{data: null, len: len + 1}}
            >
              <i className="fa-solid fa-plus fa-1x"></i>
              <span>Ajouter</span>
            </NavLink>
          )}
    </div>
  );
}

export default PageHeader;
