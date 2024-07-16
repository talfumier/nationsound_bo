import {NavLink} from "react-router-dom";
import {Tooltip} from "react-tooltip";

function NavBar() {
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
  return (
    <nav className="navbar">
      <NavLink to="/profile/1">
        <Tooltip
          className="navbar tooltip"
          anchorSelect=".avatar-anchor"
          place="bottom"
          variant="info"
          content="Profil utilisateur"
        />
        <div className="avatar avatar-anchor">HT</div>
      </NavLink>
      <hr></hr>
      {items.map((item, idx) => {
        return (
          <NavLink key={idx} to={item[0]}>
            <p>{item[1]}</p>
          </NavLink>
        );
      })}
      <hr></hr>
      <NavLink target="_blank" to="https://ng-nation-sound.vercel.app/">
        <Tooltip
          className="navbar tooltip"
          anchorSelect=".eye-anchor"
          place="bottom"
          variant="info"
          content="Site NationSound en ligne."
        />
        <div className="fa-solid fa-eye fa-2x eye-anchor "></div>
      </NavLink>
      <hr></hr>
      <NavLink to="/legal-notice">
        <p className="legal-notice">Mentions&nbsp;légales</p>
      </NavLink>
    </nav>
  );
}
export default NavBar;
