import {useEffect, useState} from "react";

function TextBox({name, label, type, required, value, rows, onHandleChange}) {
  const [data, setData] = useState("");
  const [dirty, setDirty] = useState(false);
  const [fieldValid, setFieldValid] = useState(false);
  useEffect(() => {
    setData(value);
    setFieldValid(validate(value));
  }, [value]);

  function validate(value) {
    let result = true;
    switch (type) {
      case "text":
        if (!value || value.length === 0) result = false;
        break;
    }
    return result;
  }
  return (
    <div className="textarea">
      <label className={`${fieldValid ? "valid" : "not-valid"}`}>{`${label}${
        required ? " *" : ""
      }`}</label>
      <textarea
        type={type}
        className={`text ${fieldValid ? "valid" : "not-valid"}`}
        value={data}
        onChange={(e) => {
          setDirty(true);
          setData(e.target.value);
          let valid = true;
          if (required && !validate(e.target.value)) valid = false;
          onHandleChange(name, valid, e.target.value);
          setFieldValid(valid);
        }}
        rows={rows}
      />
      {dirty && !fieldValid && (
        <div className="alert">Une valeur non nulle est obligatoire !</div>
      )}
    </div>
  );
}

export default TextBox;
