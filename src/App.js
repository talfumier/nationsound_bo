import {useState, useEffect} from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import _ from "lodash";
import Header from "./components/header/Header.jsx";
import NavBar from "./components/navbar/NavBar.jsx";
import Home from "./components/home/Home.jsx";
import Artists from "./components/artists/Artists.jsx";
import Artist from "./components/artists/Artist.jsx";
import NotFound from "./components/notFound/NotFound.jsx";

import SelectionContext from "./services/context/SelectionContext.js";
import ImagesContext from "./services/context/ImagesContext";

import "./css/global.css";
import "./css/normalize.css";
import "react-toastify/dist/ReactToastify.css";
import ContainerToast from "./components/common/toastSwal/ContainerToast.jsx";

function App() {
  const [selected, setSelected] = useState({artist: null});
  const [containers, setContainers] = useState([]);

  function handleSelected(cs, id, ckd) {
    switch (cs) {
      case "artist":
        setSelected({artist: ckd ? id : null});
        break;
    }
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
  return (
    <>
      <Header></Header>
      {/* wrapper necessary for sticky footer*/}
      <div className="app-wrapper">
        <div className="app-main-content">
          <BrowserRouter>
            <NavBar></NavBar>
            <SelectionContext.Provider
              value={{selected, onHandleSelected: handleSelected}}
            >
              <ImagesContext.Provider
                value={{containers, onHandleImages: handleImages}}
              >
                <Routes>
                  <Route path="/" element={<Home></Home>}></Route>
                  <Route path="/artists" element={<Artists></Artists>}></Route>
                  <Route
                    path="/artists/:id"
                    element={<Artist></Artist>}
                  ></Route>
                  <Route path="*" element={<NotFound></NotFound>}></Route>
                </Routes>
              </ImagesContext.Provider>
            </SelectionContext.Provider>
            <ContainerToast></ContainerToast>
          </BrowserRouter>
        </div>
      </div>
    </>
  );
}

export default App;
