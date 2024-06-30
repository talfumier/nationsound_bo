import {useEffect} from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Header from "./components/header/Header.jsx";
import NavBar from "./components/navbar/NavBar.jsx";
import Home from "./components/home/Home.jsx";
import Artists from "./components/artists/Artists.jsx";
import Artist from "./components/artists/Artist.jsx";
import useArtist from "./stores/storeArtist.js";
import NotFound from "./components/notFound/NotFound.jsx";

import "./css/global.css";
import "./css/normalize.css";
import "react-toastify/dist/ReactToastify.css";
import ContainerToast from "./components/common/toastSwal/ContainerToast.jsx";

function App() {
  const loadArtists = useArtist((state) => state.load);
  useEffect(() => {
    const abortController = new AbortController();
    loadArtists(abortController.signal);

    return () => {
      abortController.abort(); //clean-up code after component has unmounted
    };
  }, []);
  return (
    <>
      <Header></Header>
      {/* wrapper necessary for sticky footer*/}
      <div className="app-wrapper">
        <div className="app-main-content">
          <BrowserRouter>
            <NavBar></NavBar>
            <Routes>
              <Route path="/" element={<Home></Home>}></Route>
              <Route path="/artists" element={<Artists></Artists>}></Route>
              <Route path="/artists/:id" element={<Artist></Artist>}></Route>
              <Route path="*" element={<NotFound></NotFound>}></Route>
            </Routes>
            <ContainerToast></ContainerToast>
          </BrowserRouter>
        </div>
      </div>
    </>
  );
}

export default App;
