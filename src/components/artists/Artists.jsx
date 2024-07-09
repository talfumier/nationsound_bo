import {useState, useEffect, useContext} from "react";
import _ from "lodash";
import SelectionContext from "../../services/context/SelectionContext.js";
import ImagesContext from "../../services/context/ImagesContext.js";
import {getAllArtists, deleteArtist} from "../../services/httpArtists.js";
import PageHeader from "../common/PageHeader.jsx";
import CheckBox from "../common/CheckBox.jsx";
import EditMenu from "../common/EditMenu.jsx";
import {toastSuccess} from "../common/toastSwal/ToastMessages.js";

function Artists() {
  const url = "/artists";
  const contextSelection = useContext(SelectionContext);
  const contextImages = useContext(ImagesContext);
  const abortController = new AbortController();

  const [artists, setArtists] = useState([]);
  useEffect(() => {
    async function loadArtists(signal) {
      const {data: res} = await getAllArtists(null, signal);
      setArtists(
        res.data.map((item) => {
          return {
            ...item,
            active:
              contextSelection.selected["artist"] === item.id ? true : false,
          };
        })
      );
    }
    loadArtists(abortController.signal);
    return () => {
      abortController.abort(); //clean-up code after component has unmounted
    };
  }, []);
  async function handleDelete(id) {
    const {data: res} = await deleteArtist(id, null, abortController.signal); //associated images (if any) deleted as well
    if (res.statusCode === "200") {
      contextImages.onHandleImages(res.data.images_id, null, "remove");
      contextSelection.onHandleSelected("artist", -1, false);
      setArtists(
        _.filter(artists, (item) => {
          return item.id !== id;
        })
      );
    }
    toastSuccess(`Artist '${res.data.name}' supprimé avec succès !`);
  }
  return (
    <div className="page-container list">
      <PageHeader title="Artistes" len={artists.length} url={url}></PageHeader>
      <hr />
      <div className="list-container">
        {artists.map((artist) => {
          return (
            <div key={artist.id} className="list-item">
              <CheckBox
                label={artist.name}
                value={artist.active ? artist.active : false}
                onHandleChange={(ckd) => {
                  const data = [...artists];
                  data.map((item) => {
                    return (item.active = item.id === artist.id ? ckd : false);
                  });
                  contextSelection.onHandleSelected("artist", artist.id, ckd);
                  setArtists(data);
                }}
              ></CheckBox>
              <EditMenu
                url={url}
                data={{data: artist, len: artists.length}}
                onHandleDelete={() => {
                  handleDelete(artist.id);
                }}
              ></EditMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default Artists;
