import {NavLink} from "react-router-dom";

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
      {items.map((item, idx) => {
        return (
          <NavLink key={idx} to={item[0]}>
            <p>{item[1]}</p>
          </NavLink>
        );
      })}
    </nav>
  );
}
export default NavBar;
