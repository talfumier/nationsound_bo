import {useState, useEffect} from "react";
import {useCookies} from "react-cookie";
import _ from "lodash";
import {translate} from "../../services/httpGoogleServices.js";
import {
  login,
  register,
  forgotPassword,
  decodeJWT,
} from "../../services/httpUsers.js";
import PageLoader from "../common/PageLoader.jsx";
import TextInput from "../common/TextInput.jsx";
import CheckBox from "../common/CheckBox.jsx";
import {toastInfo} from "../common/toastSwal/ToastMessages.js";
import {isValidPwd} from "../common/utilityFunctions.js";

export async function requestNewPwd(email) {
  try {
    const {data: res} = await forgotPassword(email);
    const text = await translate({
      text: res.message,
      to: "fr",
    });
    toastInfo(text);
  } catch (error) {}
}

function FormLogin({}) {
  const [isLoading, setIsloading] = useState(false);
  useEffect(() => {
    if (isLoading && document.getElementsByClassName("page-loader").length > 0)
      document.getElementsByClassName("page-loader")[0].style.display = "block";
  }, [isLoading]);
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
      name: "password-match",
      label: "vérification du mot de passe",
      type: "input",
      format: "password-not-null",
    },
  ];
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const [data, setData] = useState({
    data: {user_id: "", password: "", ["password-match"]: "", cgu_cgv: false},
    creation: false,
  });

  const [formValid, setFormValid] = useState({
    user_id: false,
    password: false,
    ["password-match"]: data.creation ? false : true,
    cgu_cgv: data.creation ? false : true,
  });
  const [disabled, setDisabled] = useState(true);
  useEffect(() => {
    const cond1 = JSON.stringify(formValid).indexOf(false) !== -1;
    const cond2 = !data.creation
      ? !isValidPwd(data.data.password)
      : data.data.password !== data.data["password-match"];
    setDisabled(cond1 || cond2);
  }, [data, formValid]);
  async function handleSubmit() {
    try {
      if (!cookies.user) {
        setIsloading(true);
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
            setIsloading(false);
            break;
          case false: //login case
            res = await login(data.data.user_id, data.data.password);
            const {exp} = decodeJWT(res.headers["x-auth-token"]); //exp is expressed in seconds since EPOCH
            setCookie("user", res.headers["x-auth-token"], {
              path: "/",
              expires: new Date(exp * 1000),
            });
            setIsloading(false);
        }
      }
    } catch (error) {}
  }
  function handleEnter() {
    if (disabled) return;
    document.getElementById("button-connect").click();
  }
  return (
    <div className="modal">
      <div className="modal-content">
        {isLoading && <PageLoader></PageLoader>}
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
                onHandleBlur={() => {}} //does nothing but avoiding bug
                onHandleEnter={handleEnter}
              ></TextInput>
            )
          );
        })}
        {data.creation && (
          <CheckBox
            label={
              <div className="link-CGU-CGV">
                J'ai lu et accepte les{" "}
                <a href="/legal-notice?register=true" target="_blank">
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
          id="button-connect"
          className={`btn btn-info connect ${disabled ? "disabled" : ""}`}
          onClick={() => {
            if (disabled) return;
            handleSubmit();
          }}
        >
          {data.creation ? "S'ENREGISTRER" : "SE CONNECTER"}
        </button>
        {!data.creation && (
          <div className="bottom-actions">
            <div
              className="action forgot-pwd "
              onClick={() => {
                requestNewPwd(data.data.user_id);
              }}
            >
              mot de passe oublié ?
            </div>
            <div
              className="action no-account"
              onClick={() => {
                setData({...data, creation: true});
                setFormValid({
                  ...formValid,
                  ["password-match"]: false,
                  cgu_cgv: false,
                });
              }}
            >
              pas encore de compte ?
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default FormLogin;
