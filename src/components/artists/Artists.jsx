import {useState, useEffect} from "react";
import useArtist from "../../stores/storeArtist.js";
import PageHeader from "../common/PageHeader.jsx";
import CheckBox from "../common/CheckBox.jsx";
import EditMenu from "../common/EditMenu.jsx";

function Artists(props) {
  const artists = useArtist((state) => state.artists);
  const len = useArtist((state) => state.len);
  const active = useArtist((state) => state.selected);
  const setActive = useArtist((state) => state.select);

  return (
    <div className="page-container list">
      <PageHeader title="Artistes" len={len}></PageHeader>
      <hr />
      <div className="list-container">
        {artists.map((artist) => {
          return (
            <div key={artist.id} className="list-item">
              <CheckBox
                label={artist.name}
                value={active[artist.id] ? active[artist.id] : false}
                onHandleChange={(ckd) => {
                  setActive(artist.id, ckd);
                }}
              ></CheckBox>
              <EditMenu
                id={artist.id}
                url="/artists"
                visible={active[artist.id]}
              ></EditMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Artists;
