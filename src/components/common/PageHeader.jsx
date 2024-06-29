import {useNavigate} from "react-router-dom";

function PageHeader({title, len}) {
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
      <button className="btn btn-info">
        <i className="fa-solid fa-plus fa-1x"></i>
        <span>Ajouter</span>
      </button>
    </div>
  );
}

export default PageHeader;
