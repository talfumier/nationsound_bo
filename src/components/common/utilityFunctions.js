import {parseISO, format, isDate} from "date-fns";
import _ from "lodash";
import Joi from "joi";
import {joiPasswordExtendCore} from "joi-password";
export function isValidEmail(email) {
  const schema = Joi.object({
    email: Joi.string().email({tlds: {allow: false}}),
  });
  return !schema.validate({email}).error;
}
export function isValidPwd(pwd) {
  const joiPassword = Joi.extend(joiPasswordExtendCore);
  const schema = Joi.object({
    pwd: joiPassword
      .string()
      .min(8)
      .max(60)
      .minOfSpecialCharacters(1)
      .minOfUppercase(1)
      .minOfNumeric(1)
      .noWhiteSpaces(),
  });
  return !schema.validate({pwd}).error;
}
export function isValidInteger(str) {
  if (str.toString().includes(".") || str.toString().includes(","))
    return false;
  return !isNaN(str);
}
export function strToDate(str) {
  let arr = str.split(" ");
  arr = [...arr[0].split("."), ...(arr[1] ? arr[1].split(":") : [])];
  let result = `${arr[2]}/${arr[1]}/${arr[0]}`;
  if (arr[3]) result = result + ` ${arr[3]}:${arr[4]}`;
  return new Date(result);
}
export function isValidDate(str) {
  const arr = str.split(".");
  if (arr.length !== 3) return false;
  if (arr[0].length !== 2 || arr[1].length !== 2 || arr[2].length !== 4)
    return false;
  return !isNaN(new Date(`${arr[2]}/${arr[1]}/${arr[0]}`));
}
function isValidTime(str) {
  const arr = str.split(":");
  if (arr.length !== 2) return false;
  if (arr[0].length !== 2 || arr[1].length !== 2) return false;
  return true;
}
export function isValidDateTime(str) {
  let arr = str.split(" ");
  if (arr.length !== 2) return false;
  if (!isValidDate(arr[0])) return false;
  if (!isValidTime(arr[1])) return false;
  arr = [...arr[0].split("."), ...arr[1].split(":")];
  return !isNaN(new Date(`${arr[2]}/${arr[1]}/${arr[0]} ${arr[3]}:${arr[4]}`));
}
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
export function getEmptyFile() {
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
  let n = cont.files.length;
  if (n >= 3) return cont;
  do {
    cont.files.push(getEmptyFile());
    n += 1;
  } while (n < 3);
  return cont;
}
