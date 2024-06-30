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
