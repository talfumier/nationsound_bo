function Toolbar({status, onHandleSave}) {
  return (
    <div className="toolbar-container">
      <button
        className={`save-button ${!status.save ? "disabled" : ""}`}
        disabled={!status.save}
        onClick={() => {
          if (status.save) onHandleSave();
        }}
      >
        <i className="fa-regular fa-floppy-disk fa-3x"></i>
      </button>
    </div>
  );
}
export default Toolbar;
