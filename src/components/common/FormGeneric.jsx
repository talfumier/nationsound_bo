import {useEffect, useState, useContext} from "react";
import _ from "lodash";
import SelectionContext from "../../services/context/SelectionContext.js";
import ImagesContext from "../../services/context/ImagesContext.js";
import {fillUpContainer} from "./utilityFunctions.js";
import PageHeader from "./PageHeader.jsx";
import Toolbar from "./Toolbar.jsx";
import InputBox from "./InputBox.jsx";
import ImageUnit from "./ImageUnit.jsx";
import {range} from "./utilityFunctions.js";
import {toastSuccess, toastWarning} from "./toastSwal/ToastMessages.js";
import {
  postContainer,
  deleteContainer,
  getContainerById,
  updateContainer,
} from "../../services/httpImages.jsx";

let updatedData = {},
  updatedImages = [],
  formValid = {};
function FormGeneric({entity, id, imageYes}) {
  // entity > {name:"artist",label:"Artiste",labels:"Artistes",fields,dataIn:{data,len},functions:{patchEntity,postEntity}} | partner,
  //id > route parameter
  const abortController = new AbortController();
  const signal = abortController.signal;
  const [reset, setReset] = useState(0);
  function initFormValid() {
    entity.fields.map((field) => {
      let name = !field.name ? field.label.toLowerCase() : field.name;
      let required = field.required === undefined ? true : field.required;
      formValid[name] = id == -1 && required ? false : true; //id=-1 > new record creation case
    });
    if (imageYes) formValid.images_id = true;
  }
  useEffect(() => {
    initFormValid();
  }, []);
  /* FIELD DATA */
  const contextSelection = useContext(SelectionContext);
  const [fielddata, setFielddata] = useState({});
  useEffect(() => {
    // text data initialization
    function initEmpty() {
      const obj = {};
      entity.fields.map((field) => {
        let name = !field.name ? field.label.toLowerCase() : field.name;
        obj[name] = "";
      });
      if (imageYes) obj.images_id = null;
      return obj;
    }
    setFielddata(id != -1 ? entity.dataIn.data : initEmpty());
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
          return item._id === fielddata.images_id;
        })[0];
        if (cont) setImages(fillUpContainer(cont));
        else {
          const {data: res} = await getContainerById(_id, signal);
          contextImages.onHandleImages(null, res.data, "add");
          setImages(fillUpContainer(res.data));
        }
      }
    }
    if (imageYes) loadContainer(fielddata.images_id, signal);
  }, [reset, contextImages.containers, fielddata.images_id]);
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
      default: //text fields
        if (value !== fielddata[name]) updatedData[name] = value;
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
    setFielddata({});
    if (imageYes) setImages(fillUpContainer({_id: null, images: []}));
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
    let bl = imageYes ? false : true; //check all 3 images contain no data
    imgs.images.map((item) => {
      if (!bl && item.name.length > 0) bl = true;
    });
    if (!bl && fielddata.images_id) {
      await deleteContainer(fielddata.images_id, null, signal); //delete image container in API (mongoDB)
      contextImages.onHandleImages(fielddata.images_id, "remove");
      await entity.functions.patchEntity(
        fielddata.id,
        {images_id: null},
        null,
        signal
      ); //update fielddata in API (MySQL)
      updatedData.images_id = null;
    }
    let body = null;
    if (bl && updatedImages.length > 0) {
      body = _.filter(imgs.images, (item) => {
        return item.name.length > 0;
      });
      if (fielddata.images_id) {
        //existing image container
        await updateContainer(
          fielddata.images_id,
          {images: body},
          null,
          signal
        );
        contextImages.onHandleImages(
          fielddata.images_id,
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
    /* FIELD DATA PROCESSING */
    if (Object.keys(updatedData).length > 0) {
      if (id == -1) {
        if (imageYes && !updatedData.images_id) updatedData.images_id = null;
        const {data: res} = await entity.functions.postEntity(
          updatedData,
          null,
          signal
        );
        updatedData.id = res.data.id;
        contextSelection.onHandleSelected(entity.name, updatedData.id, true);
      } else await entity.functions.patchEntity(id, updatedData, null, signal);
      setFielddata({...fielddata, ...updatedData}); //update fielddata local state
    }

    if (imageYes) setImages(imgs); //update images local state
    setStatus({...toolbarStatus, save: false});
    toastSuccess(
      `${entity.label} '${{...fielddata, ...updatedData}.name}' ${
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
    <>
      <PageHeader title={entity.labels} len={entity.dataIn.len}></PageHeader>
      <hr />
      <Toolbar
        status={toolbarStatus}
        onHandleSave={handleSave}
        onHandleUndo={handleUndo}
      ></Toolbar>
      <hr />
      <form className="product-details">
        {entity.fields.map((field) => {
          const name = !field.name ? field.label.toLowerCase() : field.name;
          const required = field.required === undefined ? true : field.required;
          const rows = !field.rows ? "3" : field.rows;
          return (
            (field.type === "text" || field.type === "textarea") && (
              <InputBox
                key={name}
                name={name}
                label={field.label}
                type={field.type}
                required={required}
                value={fielddata[name]}
                rows={rows}
                onHandleChange={handleChange}
              ></InputBox>
            )
          );
        })}
        {imageYes && (
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
      </form>
    </>
  );
}
export default FormGeneric;
