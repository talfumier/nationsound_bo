import {useState, useEffect} from "react";
import classes from "./artists.module.css";

function Artists(props) {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize); //clean-up code
    };
  }, []);
  return (
    <div className={`page-container ${classes.artists}`}>
      <div className={classes.header}>
        <h2>Artistes</h2>
        <button className="btn btn-info">
          <i className="fa-solid fa-plus fa-1x"></i>
          <span>{`${width > 540 ? "Créer un nouveau groupe" : "Créer"}`}</span>
        </button>
      </div>
      <hr />
    </div>
  );
}

export default Artists;
