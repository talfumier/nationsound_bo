import {useEffect, useState, useContext} from "react";
import {useLocation} from "react-router-dom";
import {useParams} from "react-router-dom";
import _ from "lodash";
import SelectionContext from "../../services/context/SelectionContext.js";
import ImagesContext from "../../services/context/ImagesContext.js";
import {fillUpContainer} from "../common/utilityFunctions.jsx";
import PageHeader from "../common/PageHeader.jsx";
import Toolbar from "../common/Toolbar.jsx";
import TextBox from "../common/TextBox.jsx";
import ImageUnit from "../common/ImageUnit.jsx";
import {range} from "../common/utilityFunctions.jsx";
import {toastSuccess} from "../common/toastSwal/ToastMessages.js";
import {postArtist, patchArtist} from "../../services/httpArtists.js";
import {
  postContainer,
  deleteContainer,
  getContainerById,
  updateContainer,
} from "../../services/httpImages.jsx";

let updatedData = {},
  updatedImages = [],
  formValid = {};
function Artist() {
  const {id} = useParams(); //route parameter
  const location = useLocation();
  const abortController = new AbortController();
  const signal = abortController.signal;
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
      formValid[name] = id == -1 && required ? false : true; //id=-1 > new artist creation case
    });
    formValid.images_id = true;
  }
  useEffect(() => {
    initFormValid();
  }, []);
  /* ARTIST DATA */
  const contextSelection = useContext(SelectionContext);
  const [artist, setArtist] = useState({});
  useEffect(() => {
    // artist data initialization
    function initEmpty() {
      const obj = {};
      textfields.map((field) => {
        let name = !field.name ? field.label.toLowerCase() : field.name;
        obj[name] = "";
      });
      obj.images_id = null;
      return obj;
    }
    setArtist(id != -1 ? location.state.data : initEmpty());
  }, []);
  /* IMAGES DATA */
  const contextImages = useContext(ImagesContext);
  const [images, setImages] = useState(
    fillUpContainer({_id: null, images: []})
  );
  useEffect(() => {
    // images data initialization
    async function loadContainer(_id, signal) {
      if (id != -1 && _id) {
        const cont = _.filter(contextImages.containers, (item) => {
          return item._id === artist.images_id;
        })[0];
        if (cont) setImages(fillUpContainer(cont));
        else {
          const {data: res} = await getContainerById(_id, signal);
          contextImages.onHandleImages(null, res.data, "add");
          setImages(fillUpContainer(res.data));
        }
      }
    }
    loadContainer(artist.images_id, signal);
  }, [contextImages.containers, artist.images_id]);
  /* CLEAN UP */
  useEffect(() => {
    return () => {
      abortController.abort(); //clean-up code after component has unmounted
    };
  }, []);

  const [toolbarStatus, setStatus] = useState({save: false});
  function handleChange(name, fieldValid, value, idx) {
    formValid[name] = fieldValid;
    const valid = JSON.stringify(formValid).indexOf(false) === -1;
    // compare current field value with corresponding state
    switch (name) {
      case "images":
        updatedImages = _.filter(updatedImages, (item) => {
          return item[0] !== idx;
        });
        if (!_.isEqual(value, images.images[idx])) {
          updatedImages = [...updatedImages, ...[[idx, value]]];
        }
        break;
      default:
        if (value !== artist[name]) updatedData[name] = value;
        else delete updatedData[name];
    }
    const status = {...toolbarStatus};
    if (!fieldValid) status.save = false;
    else
      status.save =
        (Object.keys(updatedData).length > 0 || updatedImages.length > 0) &&
        valid; //save operation authorized when actual change and complete form is validated
    setStatus(status);
  }
  async function handleSave() {
    /* IMAGES DATA PROCESSING */
    const imgs = {...images};
    updatedImages.map((item) => {
      imgs.images[item[0]] = item[1]; //update images state clone i.a.w updatedImages
    });
    let bl = false; //check all 3 images contain no data
    imgs.images.map((item) => {
      if (!bl && item.name.length > 0) bl = true;
    });
    if (!bl && artist.images_id) {
      await deleteContainer(artist.images_id, null, signal); //delete image container in API (mongoDB)
      contextImages.onHandleImages(artist.images_id, "remove");
      await patchArtist(artist.id, {images_id: null}, null, signal); //update artist in API (MySQL)
      updatedData.images_id = null;
    }
    let body = null;
    if (bl && updatedImages.length > 0) {
      body = _.filter(imgs.images, (item) => {
        return item.name.length > 0;
      });
      if (artist.images_id) {
        //existing image container
        await updateContainer(artist.images_id, {images: body}, null, signal);
        contextImages.onHandleImages(
          artist.images_id,
          {images: body},
          "update"
        );
      } else {
        //no existing image container
        const {data: res} = await postContainer({images: body}, null, signal);
        contextImages.onHandleImages(
          null,
          {_id: res.data._id, images: body},
          "add"
        );
        updatedData.images_id = res.data._id;
      }
    }
    /* ARTIST DATA PROCESSING */
    if (Object.keys(updatedData).length > 0) {
      if (id == -1) {
        if (!updatedData.images_id) updatedData.images_id = null;
        const {data: res} = await postArtist(updatedData, null, signal);
        updatedData.id = res.data.id;
        contextSelection.onHandleSelected("artist", updatedData.id, true);
      } else await patchArtist(id, updatedData, null, signal);
      setArtist({...artist, ...updatedData}); //update artist local state
    }

    setImages(imgs); //update images local state
    setStatus({...toolbarStatus, save: false});
    toastSuccess(
      `Artist '${{...artist, ...updatedData}.name}' ${
        id == -1 ? "créé" : "mis à jour"
      } avec succès !`
    );
    updatedData = {};
    updatedImages = [];
  }

  return (
    <div className="page-container">
      <PageHeader title="Artistes" len={location.state.len}></PageHeader>
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
              value={artist[name]}
              rows={!field.rows ? "3" : field.rows}
              onHandleChange={handleChange}
            ></TextBox>
          );
        })}
        <label className="images-label">Photos</label>
        {range(0, 2).map((idx) => {
          return (
            <ImageUnit
              key={idx}
              idx={idx + 1}
              dataIn={images.images[idx]}
              onHandleChange={(val) => {
                handleChange("images", true, val, idx);
              }}
            ></ImageUnit>
          );
        })}
      </div>
    </div>
  );
}
export default Artist;
