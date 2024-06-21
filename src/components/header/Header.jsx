import classes from "./header.module.css";
import logo from "../../assets/images/logo.jpg";

function Header(props) {
  return (
    <header className={classes.header}>
      <div className={classes["logo-title"]}>
        <div className={classes["logo"]}>
          <img src={logo} alt="Logo NationSound festival" />
        </div>
        <h1>Nation Sound Festival</h1>
      </div>
    </header>
  );
}

export default Header;
