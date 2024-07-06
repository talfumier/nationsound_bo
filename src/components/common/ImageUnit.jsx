import {useState, useEffect} from "react";
import {arrayBufferToWebP} from "webp-converter-browser";
import {toDate} from "date-fns";
import TextField from "./TextField.jsx";
import {
  fileSize,
  getEmptyImage,
  getFormattedDate,
} from "./utilityFunctions.jsx";
import config from "../../config.json";
import {toastError} from "./toastSwal/ToastMessages.js";

function ImageUnit({idx, dataIn, onHandleChange}) {
  const textfields = [
    {name: "name", label: "Fichier"},
    {name: "type", label: "Type"},
    {name: "size", label: "Taille"},
    {name: "lastModified", label: "Date"},
  ];
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(dataIn);
  }, [dataIn]);

  function handleClear() {
    document.getElementById(`selectFile${idx}`).value = ""; //reset file selector
    processData(getEmptyImage());
  }
  function processData(val) {
    setValue(val);
    onHandleChange(val);
  }
  function handleSelectedFile(e) {
    const file = e.target.files[0];
    let val = getEmptyImage();
    delete val.image;
    if (typeof file !== "undefined") {
      const reader1 = new FileReader();
      reader1.onload = async function () {
        let name = file.name;
        const blob = await arrayBufferToWebP(reader1.result);
        if (blob.size > config.max_image_size) {
          toastError(
            "La taille du fichier est supérieure à la valeur max autorisée !"
          );
          return;
        }
        const reader2 = new FileReader();
        reader2.onload = function () {
          if (!file.type.includes("webp")) {
            name = file.name.split(".");
            name.splice(-1, 1);
            name = name.join(".") + ".webp";
          }
          val = {
            ...val,
            name,
            type: blob.type,
            size: blob.size,
            lastModified: file.lastModified,
            data: reader2.result,
          };
          processData(val);
        };
        reader2.readAsDataURL(blob);
      };
      reader1.readAsArrayBuffer(file);
    } else processData(val);
  }
  function displayData(key) {
    if (!value || !value[key]) return "";
    switch (key) {
      case "size":
        return fileSize(value[key]);
      case "lastModified":
        if (value[key] === 0) return "";
        else return getFormattedDate(toDate(value[key]));
      default:
        return value[key];
    }
  }
  return (
    <div className="image-container">
      <div className="buttons-container">
        <button>
          Photo
          <span className="badge">{idx}</span>
          <i className="fa fa-trash fa-1x" onClick={handleClear}></i>
        </button>
        <button
          onClick={() => {
            document.getElementById(`selectFile${idx}`).click();
          }}
        >
          Choisir<span className="badge"></span>
          <i className="fa fa-upload fa-lg"> </i>
          <input
            id={`selectFile${idx}`}
            className="upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              handleSelectedFile(e);
            }}
          />
        </button>
      </div>
      <div className="file-details">
        {textfields.map((item, i) => {
          return (
            <TextField
              key={i}
              label={item.label}
              value={displayData(item.name)}
            ></TextField>
          );
        })}
      </div>
      {value && value.data && (
        <>
          <button className="publish">{`${
            value.main ? "PHOTO EN LIGNE" : "METTRE EN LIGNE"
          }`}</button>
          <div className="image">
            <img src={value.data} alt={value.name} />
          </div>
        </>
      )}
    </div>
  );
}

export default ImageUnit;
