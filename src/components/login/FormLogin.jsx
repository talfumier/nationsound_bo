import {useState} from "react";
import {useCookies} from "react-cookie";
import _ from "lodash";
import {translate} from "../../services/httpGoogleServices.js";
import {login, register, decodeJWT} from "../../services/httpUsers.js";
import TextInput from "../common/TextInput.jsx";
import CheckBox from "../common/CheckBox.jsx";
import {toastInfo} from "../common/toastSwal/ToastMessages.js";

function FormLogin(props) {
  const fields = [
    {
      name: "user_id",
      label: "identifiant (courriel)",
      type: "input",
      format: "email",
    },
    {
      name: "password",
      label: "mot de passe",
      type: "input",
      format: "password-not-null",
    },
    {
      name: "password-check",
      label: "vérification du mot de passe",
      type: "input",
      format: "password-not-null",
    },
  ];
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const [data, setData] = useState({
    data: {user_id: "", password: "", ["password-check"]: "", cgu_cgv: false},
    creation: false,
  });
  const [formValid, setFormValid] = useState({
    user_id: false,
    password: false,
    ["password-check"]: true,
    cgu_cgv: true,
  });
  const [alert, setAlert] = useState(null);
  function isFormValid() {
    return JSON.stringify(formValid).indexOf(false) === -1;
  }
  async function handleSubmit() {
    try {
      if (!cookies.user) {
        let res = null;
        switch (data.creation) {
          case true: //register case
            res = await register(
              data.data.user_id,
              "editor",
              data.data.password
            );
            const text = await translate({
              text: res.data.message,
              to: "fr",
            });
            toastInfo(text);
            break;
          case false: //login case
            res = await login(data.data.user_id, data.data.password);
            const {exp} = decodeJWT(res.headers["x-auth-token"]); //exp is expressed in seconds since EPOCH
            setCookie("user", res.headers["x-auth-token"], {
              path: "/",
              expires: new Date(exp * 1000),
            });
        }
      }
    } catch (error) {}
  }
  return (
    !cookies.user && (
      <div id="modal" className="modal">
        <div className="modal-content">
          {fields.map((field, idx) => {
            return (
              (idx !== 2 ? true : data.creation ? true : false) && (
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
                  equal={idx === 2 ? data.data.password : undefined}
                  onHandleChange={(name, valid, value) => {
                    const dta = _.cloneDeep(data);
                    dta.data[name] = value;
                    setData(dta);
                    setFormValid({...formValid, [name]: valid});
                  }}
                ></TextInput>
              )
            );
          })}
          {data.creation && (
            <CheckBox
              label={
                <div className="link-CGU-CGV">
                  J'ai lu et accepte les{" "}
                  <a href="/CGU-CGV" target="_blank">
                    termes et conditions
                  </a>
                </div>
              }
              onHandleChange={(ckd) => {
                const dta = _.cloneDeep(data);
                dta.data["cgu_cgv"] = ckd;
                setData({...data, cgu_cgv: ckd});
                setFormValid({...formValid, cgu_cgv: ckd});
              }}
            ></CheckBox>
          )}
          <button
            className={`btn btn-info connect ${
              !isFormValid() ? "disabled" : ""
            }`}
            onClick={() => {
              if (!isFormValid()) return;
              handleSubmit();
            }}
          >
            {data.creation ? "S'ENREGISTRER" : "SE CONNECTER"}
          </button>
          {!data.creation && (
            <div className="bottom-actions">
              <div className="action forgot-pwd ">mot de passe oublié ?</div>
              <div
                className="action no-account"
                onClick={() => {
                  setData({...data, creation: true});
                  setFormValid({
                    ...formValid,
                    ["password-check"]: false,
                    cgu_cgv: false,
                  });
                }}
              >
                pas encore de compte ?
              </div>
            </div>
          )}
          {alert ? alert : null}
        </div>
      </div>
    )
  );
}

export default FormLogin;
