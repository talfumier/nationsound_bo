import {useEffect, useState} from "react";

function CheckBox({label, value, onHandleChange}) {
  return (
    <label className="list-item-title">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => {
          onHandleChange(e.target.checked);
        }}
      />
      <div>{label}</div>
    </label>
  );
}
export default CheckBox;
