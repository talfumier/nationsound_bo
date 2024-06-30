import {useNavigate, NavLink} from "react-router-dom";

function PageHeader({title, len, url}) {
  const navigate = useNavigate();
  return (
    <div className="page-header">
      <button
        className="back-button"
        onClick={() => {
          navigate(-1);
        }}
      >
        <i className="fa-solid fa-arrow-left fa-3x"></i>
      </button>
      <h2>
        {title}
        <span>{len}</span>
      </h2>
      {url && (
        <NavLink className="btn btn-info" to={{pathname: `${url}/-1`}}>
          <i className="fa-solid fa-plus fa-1x"></i>
          <span>Ajouter</span>
        </NavLink>
      )}
    </div>
  );
}

export default PageHeader;
