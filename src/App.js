import {useState} from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import _ from "lodash";
import Header from "./components/header/Header.jsx";
import NavBar from "./components/navbar/NavBar.jsx";
import Home from "./components/home/Home.jsx";
import ListItems from "./components/common/ListItems.jsx";
import FormDetails from "./components/common/FormDetails.jsx";
import NotFound from "./components/notFound/NotFound.jsx";

import SelectionContext from "./services/context/SelectionContext.js";
import ImagesContext from "./services/context/ImagesContext";

import "./css/global.css";
import "./css/normalize.css";
import "react-toastify/dist/ReactToastify.css";
import ContainerToast from "./components/common/toastSwal/ContainerToast.jsx";

function App() {
  const [selected, setSelected] = useState({artist: null, partner: null});
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
  const fields = {
    artist: {
      entity: {
        name: "artist",
        label: "Artiste",
        labels: "Artistes",
      },
      fields: [
        //default values when property is missing : type > text, required > true, rows > 3, name > label.toLowerCase()
        {
          label: "Nom du groupe",
          name: "name",
        },
        {
          name: "country",
          label: "Pays d'origine",
          rows: "1",
        },
        {
          label: "Style",
        },
        {
          label: "Description",
          rows: "5",
        },
        {
          label: "Albums",
          required: false,
          rows: "5",
        },
        {
          label: "Composition",
          rows: "5",
        },
      ],
    },
    partner: {
      entity: {
        name: "partner",
        label: "Partenaire",
        labels: "Partenaires",
      },
      fields: [
        //default values when property is missing : type > text, required > true, rows > 3, name > label.toLowerCase()
        {
          label: "Nom du partenaire",
          name: "name",
        },
      ],
    },
  };
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
                  <Route
                    path="/artists"
                    element={
                      <ListItems
                        entity={fields.artist.entity}
                        url="/artists"
                        imageYes
                      ></ListItems>
                    }
                  ></Route>
                  <Route
                    path="/artists/:id"
                    element={
                      <FormDetails
                        entity={fields.artist.entity}
                        fields={fields.artist.fields}
                        imageYes
                      ></FormDetails>
                    }
                  ></Route>
                  <Route
                    path="/partners"
                    element={
                      <ListItems
                        entity={fields.partner.entity}
                        url="/partners"
                        imageYes
                      ></ListItems>
                    }
                  ></Route>
                  <Route
                    path="/partners/:id"
                    element={
                      <FormDetails
                        entity={fields.partner.entity}
                        fields={fields.partner.fields}
                        imageYes
                      ></FormDetails>
                    }
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
