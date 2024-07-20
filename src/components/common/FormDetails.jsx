import {useEffect, useState, useContext} from "react";
import {useLocation} from "react-router-dom";
import {useParams} from "react-router-dom";
import {useCookies} from "react-cookie";
import _ from "lodash";
import SelectionContext from "../../services/context/SelectionContext.js";
import ImagesContext from "../../services/context/ImagesContext.js";
import {fillUpContainer} from "./utilityFunctions.js";
import PageHeader from "./PageHeader.jsx";
import Toolbar from "./Toolbar.jsx";
import TextInput from "./TextInput.jsx";
import FileUnit from "./FileUnit.jsx";
import {range} from "./utilityFunctions.js";
import {toastSuccess, toastWarning} from "./toastSwal/ToastMessages.js";
import {
  postEntity,
  patchEntity,
  getEntity,
} from "../../services/httpEntities.js";
import {
  postContainer,
  deleteContainer,
  getContainerById,
  updateContainer,
} from "../../services/httpFiles.jsx";

let updatedData = {},
  updatedFiles = [],
  formValid = {};

function FormDetails({entity, fields}) {
  // entity > {name:"artist",label:"Artiste",labels:"Artistes",fileYes, noList}
  if (!entity.fileYes) entity.fileYes = "";
  if (!entity.noList) entity.noList = "";

  const {id} = useParams(); //route parameter
  const location = useLocation();
  const abortController = new AbortController();
  const signal = abortController.signal;
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const [reset, setReset] = useState(0);
  function initFormValid() {
    fields.map((field) => {
      let name = !field.name ? field.label.toLowerCase() : field.name;
      let required = field.required === undefined ? true : field.required;
      formValid[name] = id == -1 && required ? false : true; //id=-1 > new record creation case
    });
    formValid.files_id = true;
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
      obj.files_id = null;
      return obj;
    }
    async function loadData(signal) {
      try {
        const {data: res} = await getEntity(
          entity.name,
          cookies.user,
          id,
          signal
        );
        setFieldData(res.data);
      } catch (error) {}
    }
    if (!entity.noList)
      setFieldData(id != -1 ? location.state.data : initEmpty());
    else loadData(signal);
  }, [reset]);
  /* FILES DATA */
  const contextImages = useContext(ImagesContext);
  const [files, setFiles] = useState(fillUpContainer({_id: null, files: []}));
  useEffect(() => {
    // files data initialization
    async function loadContainer(_id, signal) {
      try {
        if (id != -1 && _id) {
          const cont = _.filter(contextImages.containers, (item) => {
            return item._id === fieldData.files_id;
          })[0];
          if (cont) setFiles(fillUpContainer(cont));
          else {
            const {data: res} = await getContainerById(_id, signal);
            contextImages.onHandleImages(null, res.data, "add");
            setFiles(fillUpContainer(res.data));
          }
        }
      } catch (error) {}
    }
    if (entity.fileYes) loadContainer(fieldData.files_id, signal);
  }, [reset, contextImages.containers, fieldData.files_id]);
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
          modified = modified ? modified.getTime() : null;
          original = new Date(original).getTime();
      }
      if (!modified) modified = "";
      if (!original) original = "";
      return !_.isEqual(modified, original);
    }
    formValid[name] = fieldValid;
    const valid = JSON.stringify(formValid).indexOf(false) === -1;
    // compare current field value with corresponding state
    switch (name) {
      case "files":
        updatedFiles = _.filter(updatedFiles, (item) => {
          return item[0] !== idx;
        });
        if (!_.isEqual(value, files.files[idx])) {
          updatedFiles = [...updatedFiles, ...[[idx, value]]];
        }
        break;
      default: // fields
        if (actualChange(value, fieldData[name])) updatedData[name] = value;
        else delete updatedData[name];
    }
    const status = {...toolbarStatus};
    const bl = Object.keys(updatedData).length > 0 || updatedFiles.length > 0;
    if (!fieldValid) status.save = false;
    else status.save = bl && valid; //save operation authorized when actual change and complete form is validated
    status.undo = bl;
    setStatus(status);
  }
  function handleUndo() {
    setFieldData({});
    if (entity.fileYes) setFiles(fillUpContainer({_id: null, files: []}));
    setReset(reset + 1);
    setStatus({save: false, undo: false});
    resetChangeMonitor();
  }
  function handleMain(val, idx) {
    let bl = false;
    files.files.map((item, i) => {
      if (!bl && i === idx && item.size === 0) bl = true; //new file not yet saved
    });
    if (bl) {
      toastWarning(
        "Merci d'enregistrer le fichier avant de la mettre en ligne !"
      );
      return;
    }
    const fls = _.cloneDeep(files);
    fls.files.map((item, i) => {
      if (!val && i === idx) return (item.main = false);
      if (val) return (item.main = i === idx ? true : false);
    });
    fls.files.map((item, i) => {
      handleChange("files", null, true, item, i);
    });
    setFiles(fls);
  }
  async function handleSave() {
    /* FILES DATA PROCESSING */
    const fls = _.cloneDeep(files);
    updatedFiles.map((item) => {
      fls.files[item[0]] = item[1]; //update files state clone i.a.w updatedFiles
    });
    let bl = false; //check all 3 files contain no data
    fls.files.map((item) => {
      if (!bl && item.name.length > 0) bl = true;
    });
    if (!bl && fieldData.files_id) {
      try {
        await deleteContainer(fieldData.files_id, cookies.user, signal); //delete file container in API (mongoDB)
        contextImages.onHandleImages(fieldData.files_id, "remove");
        await patchEntity(
          entity.name,
          fieldData.id,
          {files_id: null},
          cookies.user,
          signal
        ); //update field data in API (MySQL)
        updatedData.files_id = null;
      } catch (error) {
        //catching errors handled by axios interceptors in httpService.js
      }
    }
    let body = null;
    if (bl && updatedFiles.length > 0) {
      try {
        body = _.filter(fls.files, (item) => {
          return item.name.length > 0;
        });
        if (fieldData.files_id) {
          //existing file container
          await updateContainer(
            fieldData.files_id,
            {files: body},
            cookies.user,
            signal
          );
          if (entity.fileYes.includes("image"))
            contextImages.onHandleImages(
              fieldData.files_id,
              {files: body},
              "update"
            );
        } else {
          //no existing file container
          const {data: res} = await postContainer(
            {files: body},
            cookies.user,
            signal
          );
          if (entity.fileYes.includes("image"))
            contextImages.onHandleImages(
              null,
              {_id: res.data._id, files: body},
              "add"
            );
          updatedData.files_id = res.data._id;
        }
      } catch (error) {
        //catching errors handled by axios interceptors in httpService.js
      }
    }
    /* FIELD DATA PROCESSING */
    if (Object.keys(updatedData).length > 0) {
      try {
        if (id == -1) {
          if (entity.fileYes && !updatedData.files_id)
            updatedData.files_id = null;
          const {data: res} = await postEntity(
            entity.name,
            updatedData,
            cookies.user,
            signal
          );
          updatedData.id = res.data.id;
          contextSelection.onHandleSelected(entity.name, updatedData.id, true);
        } else
          await patchEntity(entity.name, id, updatedData, cookies.user, signal);
        setFieldData({...fieldData, ...updatedData}); //update fieldData local state
      } catch (error) {
        //catching errors handled by axios interceptors in httpService.js
      }
    }

    if (entity.fileYes) setFiles(fls); //update files local state
    setStatus({save: false, undo: false});
    toastSuccess(
      `${entity.label} ${id == -1 ? "créé" : "mis à jour"} avec succès !`
    );
    resetChangeMonitor();
  }
  function resetChangeMonitor() {
    updatedData = {};
    updatedFiles = [];
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
    <div className={`page-container ${entity.name}`}>
      {!entity.noList && (
        <>
          <PageHeader
            title={`${entity.labels}`}
            len={location.state.len}
          ></PageHeader>
          <hr />
        </>
      )}
      <Toolbar
        back={entity.noList ? true : false}
        status={toolbarStatus}
        del={entity.name === "user" ? true : false}
        account={
          entity.name === "account" ? {validated: fieldData.validated} : false
        }
        onHandleSave={handleSave}
        onHandleUndo={handleUndo}
        onHandleAccountValidation={(value) => {
          handleChange("validated", "date-time", true, value);
        }}
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
              disabled={field.disabled === undefined ? false : field.disabled}
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
        {entity.noList.includes("users") && (
          <div className="input-container">
            <button className="btn btn-info pwd-reset">
              Changer le mot de passe
            </button>
          </div>
        )}
        {entity.fileYes.includes("umap") && (
          <a
            target="_blank"
            href="https://umap.openstreetmap.fr/en/map/nationsound_chantilly_1018592#16/49.1915/2.4771"
          >
            Lien vers carte hébergée sur umap
          </a>
        )}
        {entity.fileYes && (
          <>
            <label className="files-label">{`${
              entity.fileYes.includes("image") ? "Photos" : ""
            }${entity.fileYes.includes("umap") ? "Données" : ""}`}</label>
            {range(0, 2).map((idx) => {
              return (
                <FileUnit
                  key={idx}
                  fileYes={entity.fileYes}
                  idx={idx + 1}
                  dataIn={files.files[idx]}
                  onHandleChange={(val) => {
                    handleChange("files", null, true, val, idx);
                  }}
                  onHandleMain={(val) => {
                    handleMain(val, idx);
                  }}
                ></FileUnit>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
export default FormDetails;
