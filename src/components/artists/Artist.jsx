import {useEffect, useState, useContext} from "react";
import {useLocation} from "react-router-dom";
import {useParams} from "react-router-dom";
import _ from "lodash";
import {postArtist, patchArtist} from "../../services/httpArtists.js";
import FormGeneric from "../common/FormGeneric.jsx";

function Artist() {
  const {id} = useParams(); //route parameter
  const location = useLocation();
  const [entity, setEntity] = useState({});
  useEffect(() => {
    const fields = [
      //default values when property is missing : required > true, rows > 3, name > label.toLowerCase()
      {
        label: "Nom du groupe",
        name: "name",
        type: "textarea",
      },
      {
        name: "country",
        label: "Pays d'origine",
        rows: "1",
        type: "textarea",
      },
      {
        label: "Style",
        type: "textarea",
      },
      {
        label: "Description",
        rows: "5",
        type: "textarea",
      },
      {
        label: "Albums",
        required: false,
        rows: "5",
        type: "textarea",
      },
      {
        label: "Composition",
        rows: "5",
        type: "textarea",
      },
    ];
    setEntity({
      name: "artist",
      label: "Artiste",
      labels: "Artistes",
      fields,
      dataIn: {data: location.state.data, len: location.state.len},
      functions: {patchEntity: patchArtist, postEntity: postArtist},
    });
  }, []);

  return (
    Object.keys(entity).length === 6 && (
      <div className="page-container">
        <FormGeneric id={id} entity={entity} imageYes></FormGeneric>
      </div>
    )
  );
}
export default Artist;
