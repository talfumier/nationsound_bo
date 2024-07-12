import {useEffect, useState} from "react";
import {isValidDate, strToDate, getFormattedDate} from "./utilityFunctions";

function TextInput({
  name,
  label,
  type,
  required,
  value,
  rows,
  options,
  placeholder,
  format,
  onHandleChange,
}) {
  const [data, setData] = useState("");
  const [dirty, setDirty] = useState(false);
  const [fieldValid, setFieldValid] = useState({valid: true, msg: null});
  useEffect(() => {
    const dta =
      format === "date" ? getFormattedDate(value, "dd.MM.yyyy") : value;
    setData(dta);
    if (required) setFieldValid({valid: validate(dta).valid, msg: null});
  }, [value]);

  function validate(value) {
    if (!value || value.length === 0)
      return {
        valid: false,
        msg: (
          <span>
            Valeur <strong>non nulle</strong> obligatoire !
          </span>
        ),
      };
    let result = {valid: true, msg: null};
    switch (format) {
      case "text":
        break;
      case "date":
        if (!isValidDate(value))
          result = {
            valid: false,
            msg: (
              <span>
                Format <strong>jj.mm.aaaa</strong> non respecté !
              </span>
            ),
          };
    }
    return result;
  }
  return (
    <div className="input-container">
      <label>{`${label}${required ? " *" : ""}`}</label>
      {type === "textarea" && (
        <textarea
          className={`text ${fieldValid ? "valid" : "not-valid"}`}
          placeholder={placeholder}
          value={data}
          onChange={(e) => {
            setDirty(true);
            setData(e.target.value);
            let valid = {valid: true, msg: null};
            if (required) valid = validate(e.target.value);
            onHandleChange(
              name,
              valid.valid,
              format !== "date" ? e.target.value : strToDate(e.target.value)
            );
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
            setFieldValid({valid: true, msg: null});
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
      {dirty && !fieldValid.valid && (
        <div className="alert">{fieldValid.msg}</div>
      )}
    </div>
  );
}

export default TextInput;
