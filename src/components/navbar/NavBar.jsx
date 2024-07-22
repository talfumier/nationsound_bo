import {useEffect, useState, useContext} from "react";
import {NavLink} from "react-router-dom";
import {useCookies} from "react-cookie";
import _ from "lodash";
import {getContainerById} from "../../services/httpFiles.jsx";
import {Tooltip} from "react-tooltip";
import {decodeJWT} from "../../services/httpUsers.js";
import ImagesContext from "../../services/context/ImagesContext.js";

function NavBar() {
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const currentUser = cookies.user ? decodeJWT(cookies.user) : null;

  const contextImages = useContext(ImagesContext);

  const abortController = new AbortController();
  const signal = abortController.signal;
  const [avatar, setAvatar] = useState([]);

  const items = [
    ["/", "Accueil"],
    ["/messages", "Messages"],
    ["/dates", "Dates"],
    ["/pois", "Lieux"],
    ["/artists", "Artistes"],
    ["/events", "Programme"],
    ["/partners", "Partenaires"],
    ["/transports", "Transport"],
    ["/faqs", "FAQ"],
    ["/maps", "Carte"],
    ["/logos", "Logo"],
  ];
  useEffect(() => {
    async function loadAvatar() {
      let file = null;
      if (currentUser.files_id) {
        const {data: res} = await getContainerById(
          currentUser.files_id,
          signal
        );
        contextImages.onHandleImages(null, res.data, "add");
        file = _.filter(res.data.files, (img) => {
          return img.main === true;
        })[0];
      }
      if (file) setAvatar(["file", file.data]);
      else {
        const str = Array.from(
          (currentUser.first_Name
            ? currentUser.first_Name
            : currentUser.email
          ).substring(0, 2)
        );
        str[0] = str[0].toUpperCase();
        str[1] = str[1].toLowerCase();
        setAvatar(["text", str.join("")]);
      }
    }
    loadAvatar();
  }, []);
  return (
    <nav className="navbar">
      <NavLink to={`/users/${currentUser.id}`}>
        <Tooltip
          className="navbar tooltip"
          anchorSelect=".avatar-anchor"
          place="bottom"
          variant="info"
          content="Profil utilisateur"
        />
        <div className="avatar avatar-anchor">
          {avatar[0] === "text" ? (
            avatar[1]
          ) : (
            <img src={avatar[1]} alt=""></img>
          )}
        </div>
      </NavLink>
      {currentUser.role === "admin" && (
        <>
          <hr></hr>
          <NavLink key={-1} to="/accounts">
            <Tooltip
              className="navbar tooltip"
              anchorSelect=".menu-admin"
              place="bottom"
              variant="info"
              content="Réservé à l'administrateur: gestion des comptes."
            />
            <p className="menu-admin">Comptes</p>
          </NavLink>
        </>
      )}
      <hr></hr>
      {items.map((item, idx) => {
        return (
          <NavLink key={idx} to={item[0]}>
            <p>{item[1]}</p>
          </NavLink>
        );
      })}
      <hr></hr>
      <NavLink
        target="_blank"
        to="https://henri.mspr.dev/wp-admin/edit.php?post_type=page&page=tickets-attendees&event_id=29333"
      >
        <Tooltip
          className="navbar tooltip"
          anchorSelect=".wp-anchor"
          place="bottom"
          variant="info"
          content="Lien vers site WordPress"
        />
        <p className="wp-anchor">Billetterie</p>
      </NavLink>
      <hr></hr>
      <NavLink target="_blank" to="https://ng-nation-sound.vercel.app/">
        <Tooltip
          className="navbar tooltip"
          anchorSelect=".eye-anchor"
          place="bottom"
          variant="info"
          content="Site NationSound en ligne."
        />
        <p className="fa-regular fa-eye fa-2x eye eye-anchor"></p>
      </NavLink>
      <hr></hr>
      <NavLink to="/legal-notice">
        <p className="legal-notice">Mentions&nbsp;légales</p>
      </NavLink>
    </nav>
  );
}
export default NavBar;
