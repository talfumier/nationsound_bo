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
      {label}
    </label>
  );
}
export default CheckBox;
