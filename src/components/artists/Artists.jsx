import {useState, useEffect} from "react";
import _ from "lodash";
import ListItems from "../common/ListItems.jsx";
import {getAllArtists, deleteArtist} from "../../services/httpArtists.js";

function Artists() {
  const [entity, setEntity] = useState({});
  useEffect(() => {
    setEntity({
      name: "artist",
      label: "Artiste",
      labels: "Artistes",
      functions: {loadItems: getAllArtists, deleteItem: deleteArtist},
    });
  }, []);

  return (
    Object.keys(entity).length === 4 && (
      <ListItems entity={entity} url="/artists" imageYes></ListItems>
    )
  );
}
export default Artists;
