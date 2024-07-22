import {useState, useEffect} from "react";
import _ from "lodash";
import {translate} from "../../services/httpGoogleServices.js";
import TextInput from "../common/TextInput.jsx";
import {resetPassword} from "../../services/httpUsers.js";
import {toastSuccess} from "../common/toastSwal/ToastMessages.js";

function FormRecover({id, token}) {
  const fields = [
    {
      name: "password",
      label: "nouveau mot de passe",
      type: "input",
      format: "password-not-null",
    },
    {
      name: "password-match",
      label: "vérification du mot de passe",
      type: "input",
      format: "password-not-null",
    },
  ];
  const [data, setData] = useState({
    data: {password: "", ["password-match"]: ""},
  });
  useEffect(() => {});
  const [formValid, setFormValid] = useState({
    password: false,
    ["password-match"]: false,
  });
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    setDisabled(
      JSON.stringify(formValid).indexOf(false) !== -1 ||
        data.data.password !== data.data["password-match"]
    );
  }, [data, formValid]);
  async function handleSubmit() {
    try {
      const res = await resetPassword(id, token, data.data.password);
      const text = await translate({
        text: res.data.message,
        to: "fr",
      });
      toastSuccess(text);
    } catch (error) {}
  }
  return (
    <div className="modal">
      <div className="modal-content">
        {fields.map((field, idx) => {
          return (
            <TextInput
              key={field.name}
              name={field.name}
              label={field.label}
              type={field.type}
              disabled={false}
              required={true}
              value=""
              placeholder={null}
              format={field.format ? field.format : "text"}
              equal={idx === 1 ? data.data.password : undefined}
              onHandleChange={(name, valid, value) => {
                const dta = _.cloneDeep(data);
                dta.data[name] = value;
                setData(dta);
                setFormValid({...formValid, [name]: valid});
              }}
              onHandleBlur={(valid) => {
                setFormValid({...formValid, [field.name]: valid});
              }}
            ></TextInput>
          );
        })}
        <button
          className={`btn btn-info connect ${disabled ? "disabled" : ""}`}
          onClick={() => {
            if (disabled) return;
            handleSubmit();
          }}
        >
          VALIDER
        </button>
      </div>
    </div>
  );
}
export default FormRecover;
