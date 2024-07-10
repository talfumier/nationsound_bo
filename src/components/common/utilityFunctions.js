import {parseISO, format, isDate} from "date-fns";
import _ from "lodash";
export function getFormattedDate(date, frmt) {
  if (typeof frmt === "undefined") frmt = "dd.MM.yyyy HH:mm";
  try {
    if (_.isString(date)) {
      if (date.length > 0) return format(parseISO(date), frmt);
      else return "";
    }
    if (isDate(date)) return format(date, frmt);
  } catch (error) {
    console.log("Error in getFormattedDate - utilityFunctions", error);
  }
}
export function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
export function range(start, end) {
  return Array(end - start + 1)
    .fill()
    .map((_, idx) => start + idx);
}
export function fileSize(size) {
  if (size < 1024) {
    return `${size} bytes`;
  } else if (size >= 1024 && size < 1048576) {
    return `${(size / 1024).toFixed(1)} KB`;
  } else if (size >= 1048576) {
    return `${(size / 1048576).toFixed(1)} MB`;
  }
}
export function getEmptyImage() {
  return {
    name: "",
    main: false,
    type: "",
    size: 0,
    lastModified: 0,
    data: "",
  };
}
export function fillUpContainer(cont) {
  let n = cont.images.length;
  if (n >= 3) return cont;
  do {
    cont.images.push(getEmptyImage());
    n += 1;
  } while (n < 3);
  return cont;
}
