import {useEffect, useState} from "react";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";
import _ from "lodash";
import svg from "../../assets/icons/switch-off.svg";
import {getEntities} from "../../services/httpEntities.js";
import {getContainerById} from "../../services/httpFiles.jsx";
import {loadImageFromUrl} from "../common/utilityFunctions.js";
import {SwalOkCancel} from "../common/toastSwal/SwalOkCancel.jsx";

function Header() {
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const navigate = useNavigate();
  const abortController = new AbortController();
  const signal = abortController.signal;
  const [logo, setLogo] = useState(null);
  useEffect(() => {
    async function loadLogo() {
      try {
        let file = null;
        const {data: res1} = await getEntities("logo", cookies.user, signal);
        const {data: res2} = await getContainerById(
          res1.data[0].files_id,
          signal
        );
        file = _.filter(res2.data.files, (img) => {
          return img.main === true;
        })[0];
        if (file) setLogo(await loadImageFromUrl(file.url));
      } catch (error) {
        //catching errors handled by axios interceptors in httpService.js
      }
    }
    loadLogo();
    return () => {
      abortController.abort(); //clean-up code after component has unmounted
    };
  }, []);
  return (
    <header className="header">
      <div className="logo-title">
        <div
          className="logo"
          onClick={() => {
            navigate("/");
          }}
        >
          <img src={logo} alt="Logo NationSound festival" />
        </div>
        <h1>Nation Sound Festival</h1>
      </div>
      {cookies.user && (
        <button
          className="disconnect"
          onClick={async () => {
            const result = await SwalOkCancel(
              "Merci de confirmer la déconnexion !",
              "Les données modifiées et non sauvegardées seront perdues."
            );
            if (result === "cancel") return;
            removeCookie("user");
            navigate("/");
          }}
        >
          <img src={svg} alt="déconnexion" />
          <p>Déconnexion</p>
        </button>
      )}
    </header>
  );
}

export default Header;
