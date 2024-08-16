import {useEffect, useState} from "react";
import {
  isValidDate,
  strToDate,
  getFormattedDate,
  isValidDateTime,
  isValidInteger,
  isValidEmail,
  isValidPwd,
} from "./utilityFunctions";

function TextInput({
  name,
  label,
  type,
  disabled,
  required,
  value,
  rows,
  options,
  placeholder,
  format,
  equal,
  onHandleChange,
  onHandleBlur,
  onHandleEnter,
}) {
  const [data, setData] = useState("");
  const [dirty, setDirty] = useState(false);
  const [fieldValid, setFieldValid] = useState({valid: true, msg: null});
  useEffect(() => {
    let fmt = null;
    switch (format) {
      case "date":
        fmt = "dd.MM.yyyy";
        break;
      case "date-time":
        fmt = "dd.MM.yyyy HH:mm";
    }
    const dta = fmt ? getFormattedDate(value, fmt) : value;
    setData(dta);
  }, [value]);
  const [inputType, setInputType] = useState("text");
  useEffect(() => {
    if (format && format.includes("password")) setInputType("password");
  }, []);
  function handleChange(e) {
    setDirty(true);
    setData(e.target.value);
    let valid = {valid: true, msg: null};
    if (required) valid = validate(e.target.value);
    onHandleChange(
      name,
      valid.valid,
      format !== "date" && format !== "date-time"
        ? e.target.value
        : strToDate(e.target.value)
    );
    setFieldValid(valid);
  }
  function validate(value, fmt) {
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
    switch (fmt ? fmt : format) {
      case "text":
      case "password-not-null":
        break;
      case "password-match":
        if (equal && value !== equal)
          result = {
            valid: false,
            msg: <span>Les mots de passe saisis sont différents !</span>,
          };
        break;
      case "email":
        if (!isValidEmail(value))
          result = {
            valid: false,
            msg: <span>Email non valide !</span>,
          };
        break;
      case "password":
        if (!isValidPwd(value))
          result = {
            valid: false,
            msg: (
              <span>
                Mot de passe non valide {">>>"} 8 caractères minimum incluant au
                moins un caractère spécial, une majuscule, un chiffre !
              </span>
            ),
          };
        break;
      case "integer":
        if (!isValidInteger(value))
          result = {
            valid: false,
            msg: <span>Nombre entier non valide !</span>,
          };
        break;
      case "date":
        if (!isValidDate(value))
          result = {
            valid: false,
            msg: (
              <span>
                Format <strong>jj.MM.aaaa</strong> non respecté !
              </span>
            ),
          };
        break;
      case "date-time":
        if (!isValidDateTime(value))
          result = {
            valid: false,
            msg: (
              <span>
                Format <strong>jj.MM.aaaa HH.mm</strong> non respecté !
              </span>
            ),
          };
        break;
    }
    return result;
  }
  return (
    <div className="input-container">
      <label>{`${label}${required ? " *" : ""}`}</label>
      {type === "input" && (
        <>
          <input
            type={inputType}
            className={`text ${disabled ? "disabled" : ""} ${
              fieldValid.valid ? "valid" : "not-valid"
            }`}
            placeholder={placeholder}
            value={data}
            disabled={disabled}
            onChange={handleChange}
            name={name}
            autoComplete="on"
            onBlur={(e) => {
              if (name === "password" || name === "password-match") {
                const valid = validate(e.target.value, name);
                setFieldValid(valid);
                onHandleBlur(valid.valid);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onHandleEnter();
            }}
          />
          {name.includes("password") && (
            <i
              className={`fa-regular fa-eye${
                inputType !== "password" ? "-slash" : ""
              }`}
              onClick={() => {
                setInputType(inputType === "text" ? "password" : "text");
              }}
            ></i>
          )}
        </>
      )}
      {type === "textarea" && (
        <textarea
          className={`text ${disabled ? "disabled" : ""} ${
            fieldValid.valid ? "valid" : "not-valid"
          }`}
          placeholder={placeholder}
          value={data === null ? "" : data}
          disabled={disabled}
          onChange={handleChange}
          rows={rows}
          name={name}
          autoComplete="on"
        />
      )}
      {type === "select" && (
        <select
          className={`text ${fieldValid.valid ? "valid" : "not-valid"}`}
          onChange={(e) => {
            setDirty(true);
            setData(e.target.value);
            onHandleChange(name, true, e.target.value);
            setFieldValid({valid: true, msg: null});
          }}
          value={data}
        >
          <option key={-1} className="option" value="null" hidden>
            Choisir un élément de la liste
          </option>
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
