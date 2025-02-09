import * as fs from "fs";
import { resolve } from "./validator/resolve";
import { context, define } from "./validator";

// === Read sample.json and call validate ===
if (require.main === module) {
  try {
    const data = fs.readFileSync("sample.json", "utf-8");
    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid input: Expected an array of declarations");
    }

    for (const item of parsed) {
      define(item);
    }

    resolve(context);
    console.log(JSON.stringify(context.table, null, 2));
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

export default {
  // parse,
  // generate,
  // transform,
  // compile,
};
