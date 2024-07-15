import {useState, useEffect, useContext} from "react";
import _ from "lodash";
import {getEntities, deleteEntity} from "../../services/httpEntities.js";
import SelectionContext from "../../services/context/SelectionContext.js";
import ImagesContext from "../../services/context/ImagesContext.js";
import PageHeader from "./PageHeader.jsx";
import CheckBox from "./CheckBox.jsx";
import EditMenu from "./EditMenu.jsx";
import {toastSuccess} from "./toastSwal/ToastMessages.js";
import {getFormattedDate} from "./utilityFunctions.js";

function ListItems({entity, master, url}) {
  // entity > {name:"artist",label:"Artiste",labels:"Artistes",fileYes}
  const contextSelection = useContext(SelectionContext);
  const contextImages = useContext(ImagesContext);
  const abortController = new AbortController();

  const [items, setItems] = useState([]);
  const [comboData, setComboData] = useState({artists: [], pois: []});
  useEffect(() => {
    async function loadData(signal) {
      try {
        const {data: res} = await getEntities(entity.name, null, signal);
        setItems(
          _.orderBy(
            res.data.map((item) => {
              return {
                ...item,
                active:
                  contextSelection.selected[entity.name] === item.id
                    ? true
                    : false,
              };
            }),
            [entity.orderBy.field],
            [entity.orderBy.order]
          )
        );
        //load artists and pois data
        if (entity.name === "event") {
          const {data: res1} = await getEntities("artist", null, signal);
          const {data: res2} = await getEntities("poi", null, signal);
          setComboData({artists: res1.data, pois: res2.data});
        }
      } catch (error) {
        //catching errors handled by axios interceptors in httpService.js
      }
    }
    loadData(abortController.signal);
    return () => {
      abortController.abort(); //clean-up code after component has unmounted
    };
  }, [entity]);
  async function handleDelete(id) {
    try {
      const {data: res} = await deleteEntity(
        entity.name,
        id,
        null,
        abortController.signal
      ); //associated files (if any) deleted as well
      if (entity.fileYes)
        contextImages.onHandleImages(res.data.files_id, null, "remove");
      contextSelection.onHandleSelected(entity.name, -1, false);
      setItems(
        _.filter(items, (item) => {
          return item.id !== id;
        })
      );
      toastSuccess(`${entity.label} supprimé avec succès !`);
    } catch (error) {
      //catching errors handled by axios interceptors in httpService.js
    }
  }
  function getLabel(item) {
    if (url.includes("date"))
      return (
        <div>
          <span>{getFormattedDate(item[master[0].name], "dd.MM.yyyy")}</span>
          <span>&nbsp;&nbsp;{" >>> "}&nbsp;&nbsp;</span>
          <span>{getFormattedDate(item[master[1].name], "dd.MM.yyyy")}</span>
        </div>
      );
    if (url.includes("event")) {
      const artist = _.filter(comboData.artists, (row) => {
        return row.id === item.performer;
      })[0];
      const poi = _.filter(comboData.pois, (row) => {
        return row.id === item.location;
      })[0];
      try {
        return (
          <div className="event-container">
            <span>{artist.name}</span>
            <div className="event-date">
              <span>{getFormattedDate(item.date, "dd.MM")}</span>{" "}
              <span>{getFormattedDate(item.date, "HH:mm")}</span>
            </div>
            <span className={`event-type ${item.type}`}>{item.type}</span>
            <span className={`event-location ${poi.type}`}>{poi.name}</span>
          </div>
        );
      } catch (error) {}
    }
    return item[master[0].name];
  }
  return (
    <div className="page-container list">
      <PageHeader
        title={`${entity.labels}`}
        len={items.length}
        url={url}
        data={comboData}
      ></PageHeader>
      <hr />
      <div className="list-container">
        {items.map((item, idx) => {
          return (
            <div key={item.id} className="list-item">
              <CheckBox
                label={getLabel(item)}
                value={item.active ? item.active : false}
                onHandleChange={(ckd) => {
                  const data = [...items];
                  data.map((it) => {
                    return (it.active = it.id === item.id ? ckd : false);
                  });
                  contextSelection.onHandleSelected(entity.name, item.id, ckd);
                  setItems(data);
                }}
              ></CheckBox>
              <EditMenu
                url={url}
                data={{entity, data: item, len: items.length, comboData}}
                onHandleDelete={() => {
                  handleDelete(item.id);
                }}
              ></EditMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListItems;
