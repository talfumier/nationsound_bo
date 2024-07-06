import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import _ from "lodash";
import useArtist from "../../stores/storeArtist.js";
import useImage from "../../stores/storeImage.js";
import {getEmptyImage} from "../common/utilityFunctions.jsx";
import PageHeader from "../common/PageHeader.jsx";
import Toolbar from "../common/Toolbar.jsx";
import TextBox from "../common/TextBox.jsx";
import ImageUnit from "../common/ImageUnit.jsx";
import {range} from "../common/utilityFunctions.jsx";
import {toastSuccess} from "../common/toastSwal/ToastMessages.js";

let updatedData = {},
  updatedImages = [],
  formValid = {};
function Artist() {
  const {id} = useParams(); //route parameter
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

  const artists = useArtist((state) => state.artists);
  const len = useArtist((state) => state.len);
  const create = useArtist((state) => state.create);
  const update = useArtist((state) => state.update);
  /* DEALING WITH ARTIST DATA */
  const [data, setData] = useState({});
  useEffect(() => {
    let dta = {};
    if (id != -1 && artists.length > 0)
      dta = _.filter(artists, (artist) => {
        return artist.id == id;
      })[0];
    if (Object.keys(dta).length === 0) dta = initEmpty();
    setData(dta);
  }, [artists]);
  function initEmpty() {
    const obj = {};
    textfields.map((field) => {
      let name = !field.name ? field.label.toLowerCase() : field.name;
      obj[name] = "";
    });
    obj.images_id = null;
    return obj;
  }
  /* DEALING WITH IMAGES DATA */
  const load = useImage((state) => state.loadById);
  const deleteContainer = useImage((state) => state.delete);
  const updateContainer = useImage((state) => state.update);
  const createContainer = useImage((state) => state.create);
  const [images, setImages] = useState({_id: null, images: []});
  // useEffect(() => {
  //   if (id == -1 || !data.images_id) return;
  //   async function loadData() {
  //     const imgs = await load(data.images_id, signal);
  //     setImages(imgs);
  //   }
  //   loadData();
  // }, [data.images_id]);
  useEffect(() => {
    async function loadData() {
      let imgs = {_id: null, images: []};
      if (id == -1 || !data.images_id)
        do {
          imgs.images.push(getEmptyImage());
        } while (imgs.images.length < 3);
      else imgs = await load(data.images_id, signal);
      setImages(imgs);
      console.log("use", imgs);
    }
    loadData();
  }, [data.images_id]);
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
        if (value !== data[name]) updatedData[name] = value;
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
    console.log("updatedData", updatedData, updatedImages, images);
    let dta = {...data};
    /* IMAGES DATA PROCESSING */
    const imgs = {...images};
    updatedImages.map((item) => {
      imgs.images[item[0]] = item[1]; //update images state clone i.a.w updatedImages
    });
    let bl = false; //check all 3 images contain no data
    imgs.images.map((item) => {
      if (!bl && item.name.length > 0) bl = true;
    });
    if (!bl && data.images_id) {
      await deleteContainer(data.images_id, signal); //delete image container in API (mongoDB)
      await update(data.id, {images_id: null}, signal, false); //update artist in API (MySQL)
      dta.images_id = null;
    }
    let body = null,
      res = null;
    if (bl && updatedImages.length > 0) {
      body = _.filter(imgs.images, (item) => {
        return item.name.length > 0;
      });
      if (data.images_id)
        //existing image container
        await updateContainer(data.images_id, {images: body}, signal, false);
      else {
        //no existing image container
        res = await createContainer({images: body}, signal, false);
        dta.images_id = res._id; //update artist state clone i.a.w newly images container
      }
    }
    /* ARTIST DATA PROCESSING */
    if (updatedData) {
      body = {...updatedData, images_id: dta.images_id ? dta.images_id : null};
      if (id == -1) {
        res = await create(body, signal, false);
        body.id = res.id;
      } else await update(id, body, signal, false);
      dta = {...body};
    }
    setData(dta); //update artist local state
    console.log("save", imgs);
    setImages(imgs); //update images local state
    setStatus({...toolbarStatus, save: false});
    toastSuccess(
      `Artist '${dta.name}' ${id == -1 ? "créé" : "mis à jour"} avec succès !`
    );
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
