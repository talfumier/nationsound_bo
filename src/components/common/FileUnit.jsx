import {useState, useEffect} from "react";
import {arrayBufferToWebP} from "webp-converter-browser";
import {toDate} from "date-fns";
import TextBox from "./TextBox.jsx";
import {
  fileSize,
  getEmptyFile,
  getFormattedDate,
  loadImageFromUrl,
} from "./utilityFunctions.js";
import {environment} from "../../environment/environment.js";
import {toastError} from "./toastSwal/ToastMessages.js";

function FileUnit({fileYes, idx, dataIn, onHandleChange, onHandleMain}) {
  const textfields = [
    {name: "name", label: "Fichier"},
    {name: "type", label: "Type"},
    {name: "size", label: "Taille"},
    {name: "lastModified", label: "Date"},
  ];
  const [value, setValue] = useState(null);
  useEffect(() => {
    async function loadImage() {
      setValue({...dataIn, data: await loadImageFromUrl(dataIn.url)});
    }
    if (dataIn.url) loadImage();
    else setValue(dataIn);
  }, [dataIn]);

  function handleClear() {
    document.getElementById(`selectFile${idx}`).value = ""; //reset file selector
    processData(getEmptyFile());
  }
  function processData(val) {
    setValue(val);
    onHandleChange(val);
  }
  function handleSelectedFile(e) {
    const file = e.target.files[0];
    let val = getEmptyFile();
    if (typeof file !== "undefined") {
      const reader1 = new FileReader();
      if (fileYes.includes("image")) {
        reader1.onload = async function () {
          let name = file.name;
          const blob = await arrayBufferToWebP(reader1.result);
          if (blob.size > environment.max_file_size) {
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
              url: null,
              data: reader2.result,
            };
            processData(val);
          };
          reader2.readAsDataURL(blob);
        };
        reader1.onerror = function (error) {
          console.log(
            "Error during image file upload in FileUnit.jsx: ",
            error
          );
        };
        reader1.readAsArrayBuffer(file);
      }
      if (fileYes.includes("umap")) {
        reader1.readAsText(file);
        reader1.onload = function () {
          val = {
            ...val,
            name: file.name,
            type: file.type ? file.type : "umap",
            size: file.size,
            lastModified: file.lastModified,
            url: null,
            data: btoa(reader1.result),
          };
          processData(val);
        };
        reader1.onerror = function (error) {
          console.log("Error during umap file upload in FileUnit.jsx: ", error);
        };
      }
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
  const text = () => {
    if (fileYes.includes("image")) return "Photo";
    if (fileYes.includes("umap")) return "Fichier";
    return "";
  };
  return (
    <div className="file-container">
      <div className="buttons-container">
        <button>
          {text()}
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
            accept={fileYes}
            onChange={(e) => {
              handleSelectedFile(e);
            }}
          />
        </button>
      </div>
      <div className="file-details">
        {textfields.map((item, i) => {
          return (
            <TextBox
              key={i}
              label={item.label}
              value={displayData(item.name)}
            ></TextBox>
          );
        })}
      </div>
      {value && value.data && (
        <>
          <button
            className="publish"
            onClick={() => {
              onHandleMain(!value.main, value);
            }}
          >{`${value.main ? "ACTIF" : "ACTIVER"}`}</button>
          {fileYes.includes("image") && (
            <div className="file">
              <img src={value.data} alt={value.name} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FileUnit;
