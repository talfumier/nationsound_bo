import {useEffect, useState, useContext} from "react";
import {useLocation} from "react-router-dom";
import {useParams} from "react-router-dom";
import _ from "lodash";
import SelectionContext from "../../services/context/SelectionContext.js";
import ImagesContext from "../../services/context/ImagesContext.js";
import {fillUpContainer} from "./utilityFunctions.js";
import PageHeader from "./PageHeader.jsx";
import Toolbar from "./Toolbar.jsx";
import TextInput from "./TextInput.jsx";
import ImageUnit from "./ImageUnit.jsx";
import {range} from "./utilityFunctions.js";
import {toastSuccess, toastWarning} from "./toastSwal/ToastMessages.js";
import {postEntity, patchEntity} from "../../services/httpEntities.js";
import {
  postContainer,
  deleteContainer,
  getContainerById,
  updateContainer,
} from "../../services/httpImages.jsx";

let updatedData = {},
  updatedImages = [],
  formValid = {};

function FormDetails({entity, fields}) {
  // entity > {name:"artist",label:"Artiste",labels:"Artistes",imageYes}
  const {id} = useParams(); //route parameter
  const location = useLocation();
  const abortController = new AbortController();
  const signal = abortController.signal;
  const [reset, setReset] = useState(0);
  function initFormValid() {
    fields.map((field) => {
      let name = !field.name ? field.label.toLowerCase() : field.name;
      let required = field.required === undefined ? true : field.required;
      formValid[name] = id == -1 && required ? false : true; //id=-1 > new record creation case
    });
    formValid.images_id = true;
  }
  useEffect(() => {
    initFormValid();
  }, []);
  /* FIELDS DATA */
  const contextSelection = useContext(SelectionContext);
  const [fieldData, setFieldData] = useState({});
  useEffect(() => {
    // field data initialization
    function initEmpty() {
      const obj = {};
      fields.map((field) => {
        let name = !field.name ? field.label.toLowerCase() : field.name;
        obj[name] = "";
      });
      obj.images_id = null;
      return obj;
    }
    setFieldData(id != -1 ? location.state.data : initEmpty());
  }, [reset]);
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
          return item._id === fieldData.images_id;
        })[0];
        if (cont) setImages(fillUpContainer(cont));
        else {
          const {data: res} = await getContainerById(_id, signal);
          contextImages.onHandleImages(null, res.data, "add");
          setImages(fillUpContainer(res.data));
        }
      }
    }
    if (entity.imageYes) loadContainer(fieldData.images_id, signal);
  }, [reset, contextImages.containers, fieldData.images_id]);
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
      default: // fields
        if (value !== fieldData[name]) updatedData[name] = value;
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
  function handleUndo() {
    setFieldData({});
    if (entity.imageYes) setImages(fillUpContainer({_id: null, images: []}));
    setReset(reset + 1);
    setStatus({save: false});
    resetChangeMonitor();
  }
  function handleMain(val, idx) {
    let bl = false;
    updatedImages.map((item) => {
      if (!bl && item[0] === 2) bl = true; //new image not yet saved
    });
    if (bl) {
      toastWarning("Merci d'enregistrer l'image avant de la mettre en ligne !");
      return;
    }
    const imgs = _.cloneDeep(images);
    imgs.images.map((item, i) => {
      if (!val && i === idx) return (item.main = false);
      if (val) return (item.main = i === idx ? true : false);
    });
    imgs.images.map((item, i) => {
      handleChange("images", true, item, i);
    });
    setImages(imgs);
  }
  async function handleSave() {
    /* IMAGES DATA PROCESSING */
    const imgs = _.cloneDeep(images);
    updatedImages.map((item) => {
      imgs.images[item[0]] = item[1]; //update images state clone i.a.w updatedImages
    });
    let bl = false; //check all 3 images contain no data
    imgs.images.map((item) => {
      if (!bl && item.name.length > 0) bl = true;
    });
    if (!bl && fieldData.images_id) {
      await deleteContainer(fieldData.images_id, null, signal); //delete image container in API (mongoDB)
      contextImages.onHandleImages(fieldData.images_id, "remove");
      await patchEntity(
        entity.name,
        fieldData.id,
        {images_id: null},
        null,
        signal
      ); //update field data in API (MySQL)
      updatedData.images_id = null;
    }
    let body = null;
    if (bl && updatedImages.length > 0) {
      body = _.filter(imgs.images, (item) => {
        return item.name.length > 0;
      });
      if (fieldData.images_id) {
        //existing image container
        await updateContainer(
          fieldData.images_id,
          {images: body},
          null,
          signal
        );
        contextImages.onHandleImages(
          fieldData.images_id,
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
        if (entity.imageYes && !updatedData.images_id)
          updatedData.images_id = null;
        const {data: res} = await postEntity(
          entity.name,
          updatedData,
          null,
          signal
        );
        updatedData.id = res.data.id;
        contextSelection.onHandleSelected(entity.name, updatedData.id, true);
      } else await patchEntity(entity.name, id, updatedData, null, signal);
      setFieldData({...fieldData, ...updatedData}); //update fieldData local state
    }

    if (entity.imageYes) setImages(imgs); //update images local state
    setStatus({...toolbarStatus, save: false});
    toastSuccess(
      `${entity.label} '${{...fieldData, ...updatedData}.name}' ${
        id == -1 ? "créé" : "mis à jour"
      } avec succès !`
    );
    resetChangeMonitor();
  }
  function resetChangeMonitor() {
    updatedData = {};
    updatedImages = [];
  }
  return (
    <div className={`page-container ${entity.name}`}>
      <PageHeader
        title={`${entity.labels}`}
        len={location.state.len}
      ></PageHeader>
      <hr />
      <Toolbar
        status={toolbarStatus}
        onHandleSave={handleSave}
        onHandleUndo={handleUndo}
      ></Toolbar>
      <hr />
      <div className={`product-details ${entity.name}`}>
        {fields.map((field) => {
          const name = !field.name ? field.label.toLowerCase() : field.name;
          return (
            <TextInput
              key={name}
              name={name}
              label={field.label}
              type={field.type}
              required={field.required === undefined ? true : field.required}
              value={fieldData[name]}
              rows={!field.rows ? "3" : field.rows}
              options={field.type !== "select" ? null : field.options}
              onHandleChange={handleChange}
            ></TextInput>
          );
        })}
        {entity.imageYes && (
          <>
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
                  onHandleMain={(val) => {
                    handleMain(val, idx);
                  }}
                ></ImageUnit>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
export default FormDetails;
