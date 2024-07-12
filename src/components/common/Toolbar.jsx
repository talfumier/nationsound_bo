import {useState, useEffect} from "react";
import {Tooltip} from "react-tooltip";

function Toolbar({status, onHandleSave, onHandleUndo}) {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
  return (
    <div className="toolbar-container">
      <a className="tooltip-anchor-undo">
        <Tooltip
          className="toolbar-button tooltip"
          anchorSelect=".tooltip-anchor-undo"
          place="bottom"
          variant="info"
          content="Revenir à la version enregistrée."
        />
        <button
          className={`undo-button ${!status.save ? "disabled" : ""}`}
          disabled={!status.save}
          onClick={() => {
            if (status.save) onHandleUndo();
          }}
        >
          <i className="fa-solid fa-arrow-rotate-left fa-3x"></i>
        </button>
      </a>
      <a className="tooltip-anchor-save">
        <Tooltip
          className="toolbar-button tooltip"
          anchorSelect=".tooltip-anchor-save"
          place="bottom"
          variant="info"
          content="Enregistrer les changements."
        />
        <button
          className={`save-button ${!status.save ? "disabled" : ""}`}
          disabled={!status.save}
          onClick={() => {
            if (status.save) onHandleSave();
          }}
        >
          <i className="fa-regular fa-floppy-disk fa-3x"></i>
        </button>
      </a>
      {status.save && (
        <div className="save-reminder">
          {`Enregistrer${width > 520 ? " avant de quitter !" : " !"}`}
        </div>
      )}
    </div>
  );
}
export default Toolbar;
