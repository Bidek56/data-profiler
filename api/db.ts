// lowdb was thorwing errors, so I wrote this one as a stand-in
// from: https://stackoverflow.com/questions/67649849/using-lowdb-results-in-err-require-esm/71768640#71768640

import path from "path";
import fspromises from "fs/promises";
import fs from "fs";
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// path to json file
const FILE_PATH = path.join(__dirname, "database.json");

export const initJSONDatabase = <T>(initialData: T) => {
  const read = async () => {
    const data = await fspromises.readFile(FILE_PATH, { encoding: "utf-8" });
    return JSON.parse(data) as unknown as T;
  };

  const write = async (data: T) => {
    await fspromises.writeFile(FILE_PATH, JSON.stringify(data), {
      encoding: "utf-8",
    });
  };

  if (!fs.existsSync(FILE_PATH)) {
    write(initialData);
  }

  return {
    read,
    write,
  };
};

// -- Usage --

// const defaultState = {
//   users: [], 
//   posts: []
// }; 
// const db = initJSONDatabase(defaultState); 
// const data = await db.read(); 
// data.users.push('Jay-Z'); 
// await db.write(data); 