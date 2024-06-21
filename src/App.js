import {BrowserRouter, Routes, Route} from "react-router-dom";
import Header from "./components/header/Header.jsx";
import NavBar from "./components/navbar/NavBar.jsx";
import Home from "./components/home/Home.jsx";
import Artists from "./components/artists/Artists.jsx";
import "./css/global.css";
import "./css/normalize.css";
import classes from "./app.module.css";

function App() {
  return (
    <>
      <Header></Header>
      {/* wrapper necessary for sticky footer*/}
      <div className={classes.wrapper}>
        <div className={classes["main-content"]}>
          <BrowserRouter>
            <NavBar></NavBar>
            <Routes>
              <Route path="/" element={<Home></Home>}></Route>
              <Route path="/artists" element={<Artists></Artists>}></Route>
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </>
  );
}

export default App;
