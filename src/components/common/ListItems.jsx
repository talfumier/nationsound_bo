import {useState, useEffect, useContext} from "react";
import _ from "lodash";
import {getEntities, deleteEntity} from "../../services/httpEntities.js";
import SelectionContext from "../../services/context/SelectionContext.js";
import ImagesContext from "../../services/context/ImagesContext.js";
import PageHeader from "./PageHeader.jsx";
import CheckBox from "./CheckBox.jsx";
import EditMenu from "./EditMenu.jsx";
import {toastSuccess} from "./toastSwal/ToastMessages.js";

function ListItems({entity, url, imageYes}) {
  // entity > {name:"artist",label:"Artiste",labels:"Artistes"} ,
  const contextSelection = useContext(SelectionContext);
  const contextImages = useContext(ImagesContext);
  const abortController = new AbortController();

  const [items, setItems] = useState([]);
  useEffect(() => {
    async function loadData(signal) {
      const {data: res} = await getEntities(entity.name, null, signal);
      setItems(
        res.data.map((item) => {
          return {
            ...item,
            active:
              contextSelection.selected[entity.name] === item.id ? true : false,
          };
        })
      );
    }
    loadData(abortController.signal);
    return () => {
      abortController.abort(); //clean-up code after component has unmounted
    };
  }, [entity]);
  async function handleDelete(id) {
    const {data: res} = await deleteEntity(id, null, abortController.signal); //associated images (if any) deleted as well
    if (imageYes)
      contextImages.onHandleImages(res.data.images_id, null, "remove");
    contextSelection.onHandleSelected(entity.name, -1, false);
    setItems(
      _.filter(items, (item) => {
        return item.id !== id;
      })
    );
    toastSuccess(`${entity.label} '${res.data.name}' supprimé avec succès !`);
  }
  return (
    <div className="page-container list">
      <PageHeader
        title={`${entity.labels}`}
        len={items.length}
        url={url}
      ></PageHeader>
      <hr />
      <div className="list-container">
        {items.map((item) => {
          return (
            <div key={item.id} className="list-item">
              <CheckBox
                label={item.name}
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
                data={{entity, data: item, len: items.length}}
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
