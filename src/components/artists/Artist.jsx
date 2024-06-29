import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import _ from "lodash";
import useArtist from "../../stores/storeArtist.js";
import PageHeader from "../common/PageHeader.jsx";
import Toolbar from "../common/Toolbar.jsx";
import TextBox from "../common/TextBox.jsx";

let updatedData = {},
  formValid = {};
function Artist() {
  const {id} = useParams(); //route parameter
  const textfields = [
    //default values when property is missing : type > text, required > true, rows > 3, name > label.toLowerCase()
    {
      label: "Nom du groupe",
      name: "name",
    },
    {
      name: "country",
      label: "Pays d'origine",
      rows: "1",
    },
    {
      label: "Style",
    },
    {
      label: "Description",
      rows: "5",
    },
    {
      label: "Albums",
      required: false,
      rows: "5",
    },
    {
      label: "Composition",
      rows: "5",
    },
  ];
  function initFormValid() {
    textfields.map((field) => {
      let name = !field.name ? field.label.toLowerCase() : field.name;
      let required = field.required === undefined ? true : field.required;
      formValid[name] = id === -1 && required ? false : true; //id=-1 > new artist creation case
    });
  }
  useEffect(() => {
    initFormValid();
  }, []);

  const artists = useArtist((state) => state.artists);
  const len = useArtist((state) => state.len);
  const update = useArtist((state) => state.update);

  const [data, setData] = useState({});
  useEffect(() => {
    if (artists.length === 0) return;
    setData(
      _.filter(artists, (artist) => {
        return artist.id == id;
      })[0]
    );
  }, [artists]);
  const abortController = new AbortController();
  useEffect(() => {
    return () => {
      abortController.abort(); //clean-up code after component has unmounted
    };
  }, []);

  const [toolbarStatus, setStatus] = useState({save: false});
  function handleChange(name, fieldValid, value) {
    formValid[name] = fieldValid;
    const valid = JSON.stringify(formValid).indexOf(false) === -1;
    // compare current field value with corresponding state
    if (value !== data[name]) updatedData[name] = value;
    else delete updatedData[name];
    const status = {...toolbarStatus};
    if (!fieldValid) status.save = false;
    else status.save = actualChange() && valid; //save operation authorized when actual change and complete form is validated
    setStatus(status);
  }
  function actualChange() {
    let bl = false;
    Object.keys(updatedData).map((key) => {
      if (!bl && !_.isEqual(updatedData[key], data[key])) bl = true;
    });
    return bl;
  }
  async function handleSave() {
    console.log(updatedData);
    const res = await update(id, updatedData, abortController.signal);

    setStatus({...toolbarStatus, save: false});
  }

  return (
    <div className="page-container">
      <PageHeader title="Artistes" len={len}></PageHeader>
      <hr />
      <Toolbar status={toolbarStatus} onHandleSave={handleSave}></Toolbar>
      <div className="product-details">
        {textfields.map((field) => {
          const name = !field.name ? field.label.toLowerCase() : field.name;
          return (
            <TextBox
              key={name}
              name={name}
              label={field.label}
              type={field.type ? field.type : "text"}
              required={field.required === undefined ? true : field.required}
              value={data[name]}
              rows={!field.rows ? "3" : field.rows}
              onHandleChange={handleChange}
            ></TextBox>
          );
        })}
      </div>
    </div>
  );
}
export default Artist;
