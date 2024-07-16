import {useNavigate} from "react-router-dom";
import {Tooltip} from "react-tooltip";

function BackButton() {
  const navigate = useNavigate();
  return (
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
  );
}

export default BackButton;
