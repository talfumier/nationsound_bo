import {useState, useEffect} from "react";
import {useCookies} from "react-cookie";
import {decodeJWT} from "../../services/httpUsers.js";
import BackButton from "./BackButton.jsx";
import {Tooltip} from "react-tooltip";
import {SwalOkCancel} from "./toastSwal/SwalOkCancel.jsx";
import {getFormattedDate, strToDate} from "./utilityFunctions.js";
import {deleteEntity} from "../../services/httpEntities.js";

function Toolbar({
  back,
  status,
  del,
  account,
  onHandleSave,
  onHandleUndo,
  onHandleAccountValidation,
}) {
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const currentUser = cookies.user ? decodeJWT(cookies.user) : null;

  const abortController = new AbortController();
  useEffect(() => {
    return () => {
      abortController.abort(); //clean-up code after component has unmounted
    };
  }, []);

  const [buttonText, setButtonText] = useState("");
  useEffect(() => {
    setButtonText(`${account.validated ? "Désactiver" : "Valider"} le compte`);
  }, [account.validated]);
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
      <div className="left">
        {back && <BackButton></BackButton>}
        <a className="tooltip-anchor-undo">
          <Tooltip
            className="toolbar-button tooltip"
            anchorSelect=".tooltip-anchor-undo"
            place="bottom"
            variant="info"
            content="Revenir à la version enregistrée."
          />
          <button
            className={`undo-button ${!status.undo ? "disabled" : ""}`}
            disabled={!status.undo}
            onClick={() => {
              if (status.undo) onHandleUndo();
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

      <div className="right">
        {account && (
          <button
            className="btn btn-info validation-button"
            onClick={async () => {
              const elt = document.getElementsByClassName(
                "text valid disabled"
              )[0];
              if (elt.value === "") {
                setButtonText("Désactiver le compte");
                elt.value = getFormattedDate(
                  account.validated ? account.validated : new Date(),
                  "dd.MM.yyyy HH:mm"
                );
              } else {
                setButtonText("Activer le compte");
                elt.value = "";
              }
              onHandleAccountValidation(
                elt.value.length > 0 ? strToDate(elt.value) : null
              );
            }}
          >
            {buttonText}
          </button>
        )}
        {del && (
          <button
            className="delete-button"
            onClick={async () => {
              const result = await SwalOkCancel(
                "Merci de confirmer la suppression définitive du compte !"
              );
              if (result === "cancel") return;
              try {
                await deleteEntity(
                  "user",
                  currentUser.id,
                  cookies.user,
                  abortController.signal
                );
                removeCookie("user");
              } catch (error) {}
            }}
          >
            <i className="fa-solid fa-trash fa-3x"></i>
          </button>
        )}
      </div>
    </div>
  );
}
export default Toolbar;
