import {NavLink} from "react-router-dom";

function NavBar() {
  return (
    <nav className="navbar">
      <NavLink to="/">
        <p>Accueil</p>
      </NavLink>
      <NavLink to="/messages">
        <p>Messages</p>
      </NavLink>
      <NavLink to="/dates">
        <p>Dates</p>
      </NavLink>
      <NavLink to="/pois">
        <p>Lieux</p>
      </NavLink>
      <NavLink to="/artists">
        <p>Artistes</p>
      </NavLink>
      <NavLink to="/events">
        <p>Programme</p>
      </NavLink>
      <NavLink to="/partners">
        <p>Partenaires</p>
      </NavLink>
      <NavLink to="/transports">
        <p>Transport</p>
      </NavLink>
      <NavLink to="/faqs">
        <p>FAQ</p>
      </NavLink>
      <NavLink to="/maps">
        <p>Carte</p>
      </NavLink>
    </nav>
  );
}
export default NavBar;
