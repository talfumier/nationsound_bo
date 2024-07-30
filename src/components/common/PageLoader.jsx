import {Oval} from "react-loader-spinner";

function PageLoader() {
  return (
    <div className="page-loader">
      <Oval
        color="red"
        strokeWidth={5}
        secondaryColor="#1DFF83" //green
        strokeWidthSecondary={5}
      ></Oval>
    </div>
  );
}

export default PageLoader;
