import React from "react";

function TextField({label, value}) {
  return (
    <div className="textfield">
      <label>{label}</label>
      <div className="text">{value}</div>
    </div>
  );
}

export default TextField;
