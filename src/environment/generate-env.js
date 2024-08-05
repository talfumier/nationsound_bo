import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const setEnv = () => {
  const writeFile = fs.writeFile;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const targetPath = path.join(__dirname, "/environment.js");

  const configFile = `export const environment = {
    api_url_prod: '${process.env.NATIONSOUND_API_URL_PROD}',
    max_file_size: '${process.env.NATIONSOUND_MAX_FILE_SIZE}',
    production: true,
  };`;
  writeFile(targetPath, configFile, (err) => {
    if (err) console.error(err);
    else
      console.log(
        `Node.js environment.js file generated correctly at ${targetPath} \n`
      );
  });
};

setEnv();
