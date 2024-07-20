import {useCookies} from "react-cookie";
import logo from "../../assets/images/logo.jpg";
import svg from "../../assets/icons/switch-off.svg";
import {SwalOkCancel} from "../common/toastSwal/SwalOkCancel.jsx";

function Header() {
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  return (
    <header className="header">
      <div className="logo-title">
        <div className="logo">
          <a href="/">
            <img src={logo} alt="Logo NationSound festival" />
          </a>
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
