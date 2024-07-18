import {useCookies} from "react-cookie";
import logo from "../../assets/images/logo.jpg";
import svg from "../../assets/icons/switch-off.svg";

function Header() {
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  return (
    <header className="header">
      <div className="logo-title">
        <div className="logo">
          <img src={logo} alt="Logo NationSound festival" />
        </div>
        <h1>Nation Sound Festival</h1>
      </div>
      {cookies.user && (
        <button
          className="disconnect"
          onClick={() => {
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
