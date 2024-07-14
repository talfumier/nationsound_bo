import {useEffect, useState, useContext} from "react";
import {useLocation} from "react-router-dom";
import {useParams} from "react-router-dom";
import _ from "lodash";
import SelectionContext from "../../services/context/SelectionContext.js";
import ImagesContext from "../../services/context/ImagesContext.js";
import {fillUpContainer, getFormattedDate} from "./utilityFunctions.js";
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
        obj[field.name] = "";
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

  const [toolbarStatus, setStatus] = useState({save: false, undo: false});
  function handleChange(name, format, fieldValid, value, idx) {
    function actualChange(modified, original) {
      switch (format) {
        case "text":
          break;
        case "date":
          modified = modified.setHours(0, 0, 0, 0);
          original = new Date(original).setHours(0, 0, 0, 0);
          break;
        case "date-time":
          modified = modified.getTime();
          original = new Date(original).getTime();
      }
      return !_.isEqual(modified, original);
    }
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
        if (actualChange(value, fieldData[name])) updatedData[name] = value;
        else delete updatedData[name];
    }
    const status = {...toolbarStatus};
    const bl = Object.keys(updatedData).length > 0 || updatedImages.length > 0;
    if (!fieldValid) status.save = false;
    else status.save = bl && valid; //save operation authorized when actual change and complete form is validated
    status.undo = bl;
    setStatus(status);
  }
  function handleUndo() {
    setFieldData({});
    if (entity.imageYes) setImages(fillUpContainer({_id: null, images: []}));
    setReset(reset + 1);
    setStatus({save: false, undo: false});
    resetChangeMonitor();
  }
  function handleMain(val, idx) {
    let bl = false;
    images.images.map((item, i) => {
      if (!bl && i === idx && item.size === 0) bl = true; //new image not yet saved
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
      handleChange("images", null, true, item, i);
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
      try {
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
      } catch (error) {
        //catching errors handled by axios interceptors in httpService.js
      }
    }
    let body = null;
    if (bl && updatedImages.length > 0) {
      try {
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
      } catch (error) {
        //catching errors handled by axios interceptors in httpService.js
      }
    }
    /* FIELD DATA PROCESSING */
    if (Object.keys(updatedData).length > 0) {
      try {
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
      } catch (error) {
        //catching errors handled by axios interceptors in httpService.js
      }
    }

    if (entity.imageYes) setImages(imgs); //update images local state
    setStatus({save: false, undo: false});
    toastSuccess(
      `${entity.label} ${id == -1 ? "créé" : "mis à jour"} avec succès !`
    );
    resetChangeMonitor();
  }
  function resetChangeMonitor() {
    updatedData = {};
    updatedImages = [];
  }
  function getOptions(options) {
    if (Array.isArray(options)) return options; //simple select element with options data provided in formContent.json
    //complex select element where options data come from location.state
    return _.orderBy(location.state.comboData[options], ["name"], ["asc"]).map(
      (item) => {
        return [item.id, item.name];
      }
    );
  }
  return (
    <div className={`page-container`}>
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
          return (
            <TextInput
              key={field.name}
              name={field.name}
              label={field.label}
              type={field.type}
              required={field.required === undefined ? true : field.required}
              value={fieldData[field.name]}
              rows={!field.rows ? "3" : field.rows}
              options={
                field.type !== "select" ? null : getOptions(field.options)
              }
              placeholder={field.placeholder ? field.placeholder : null}
              format={field.format ? field.format : "text"}
              onHandleChange={(name, valid, value) => {
                handleChange(
                  name,
                  field.format ? field.format : "text",
                  valid,
                  value
                );
              }}
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
                    handleChange("images", null, true, val, idx);
                  }}
                  onHandleMain={(val) => {
                    console.log(val);
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
