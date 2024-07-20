import {useState, Fragment, useEffect} from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {useCookies} from "react-cookie";
import _ from "lodash";
import {decodeJWT} from "./services/httpUsers.js";
import Header from "./components/header/Header.jsx";
import NavBar from "./components/navbar/NavBar.jsx";
import Home from "./components/home/Home.jsx";
import ListItems from "./components/common/ListItems.jsx";
import FormDetails from "./components/common/FormDetails.jsx";
import formContent from "./components/common/formContent.json";
import NotFound from "./components/notFound/NotFound.jsx";

import SelectionContext from "./services/context/SelectionContext.js";
import ImagesContext from "./services/context/ImagesContext";

import "./css/global.css";
import "./css/normalize.css";
import "react-toastify/dist/ReactToastify.css";
import ContainerToast from "./components/common/toastSwal/ContainerToast.jsx";
import FormLogin from "./components/login/FormLogin.jsx";

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  const currentUser = cookies.user ? decodeJWT(cookies.user) : null;
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role !== "admin") delete formContent.account;
  }, [currentUser]);

  const [selected, setSelected] = useState({});
  const [containers, setContainers] = useState([]);

  function handleSelected(cs, id, ckd) {
    setSelected({...selected, [cs]: ckd ? id : null});
  }
  function handleImages(_id, data, cs) {
    let arr = [...containers];
    switch (cs) {
      case "add":
        arr.push(data);
        break;
      case "remove":
        arr = _.filter(arr, (item) => {
          return item._id !== _id;
        });
        break;
      case "update":
        const idx = arr.findIndex((item) => {
          return item._id === _id;
        });
        arr[idx] = {...arr[idx], ...data};
    }
    setContainers(arr);
  }
  // common forms' definition in formContent.json file > ListItems, FormDetails
  // default values when missing property: required > true, rows > 3
  function getMaster(fields) {
    return _.filter(fields, (item) => {
      return item.listMaster;
    });
  }
  return (
    <>
      <Header></Header>
      {/* wrapper necessary for sticky footer*/}
      <div className="app-wrapper">
        <div className="app-main-content">
          <FormLogin></FormLogin>
          {cookies.user && (
            <BrowserRouter>
              <SelectionContext.Provider
                value={{selected, onHandleSelected: handleSelected}}
              >
                <ImagesContext.Provider
                  value={{containers, onHandleImages: handleImages}}
                >
                  <NavBar></NavBar>
                  <Routes>
                    <Route path="/" element={<Home></Home>}></Route>
                    {Object.keys(formContent).map((key) => {
                      let master = getMaster(formContent[key].fields);
                      return (
                        <Fragment key={key}>
                          {!formContent[key].entity.noList && (
                            <Route
                              path={`/${key}s`}
                              element={
                                <ListItems
                                  entity={formContent[key].entity}
                                  master={master}
                                  url={`/${key}s`}
                                ></ListItems>
                              }
                            ></Route>
                          )}
                          <Route
                            path={`/${key}s/:id`}
                            element={
                              <FormDetails
                                entity={formContent[key].entity}
                                fields={formContent[key].fields}
                              ></FormDetails>
                            }
                          ></Route>
                        </Fragment>
                      );
                    })}
                    <Route path="*" element={<NotFound></NotFound>}></Route>
                  </Routes>
                </ImagesContext.Provider>
              </SelectionContext.Provider>
            </BrowserRouter>
          )}
          <ContainerToast></ContainerToast>
        </div>
      </div>
    </>
  );
}

export default App;
