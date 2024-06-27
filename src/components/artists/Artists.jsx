import {useState, useEffect} from "react";
import useArtist from "../../stores/storeArtist.js";
import classes from "./artists.module.css";

function Artists(props) {
  const artists = useArtist((state) => state.artists);
  const len = useArtist((state) => state.len);

  return (
    <div className={`page-container ${classes.artists}`}>
      <div className="page-header">
        <h2>
          Artistes<span>{len}</span>
        </h2>
        <button className="btn btn-info">
          <i className="fa-solid fa-plus fa-1x"></i>
          <span>Ajouter</span>
        </button>
      </div>
      <hr />
      <div className="list-container">
        {artists.map((artist) => {
          return (
            <div key={artist.id} className="list-item">
              <input type="checkbox" name="" id="" />
              <div className="list-item-title">{artist.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Artists;
