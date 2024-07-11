import {useEffect, useState} from "react";

function TextInput({
  name,
  label,
  type,
  required,
  value,
  rows,
  options,
  onHandleChange,
}) {
  const [data, setData] = useState("");
  const [dirty, setDirty] = useState(false);
  const [fieldValid, setFieldValid] = useState(true);
  useEffect(() => {
    setData(value);
    if (required) setFieldValid(validate(value));
  }, [value]);

  function validate(value) {
    let result = true;
    switch (type) {
      case "textarea":
        if (!value || value.length === 0) result = false;
        break;
    }
    return result;
  }
  return (
    <div className="input-container">
      <label>{`${label}${required ? " *" : ""}`}</label>
      {type === "textarea" && (
        <textarea
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
      )}
      {type === "select" && (
        <select
          className={`text ${fieldValid ? "valid" : "not-valid"}`}
          onChange={(e) => {
            setDirty(true);
            setData(e.target.value);
            onHandleChange(name, true, e.target.value);
            setFieldValid(true);
          }}
          value={data}
        >
          {options.map((option, idx) => {
            return (
              <option key={idx} className="option" value={option[0]}>
                {option[1]}
              </option>
            );
          })}
        </select>
      )}
      {dirty && !fieldValid && (
        <div className="alert">Une valeur non nulle est obligatoire !</div>
      )}
    </div>
  );
}

export default TextInput;
