import { join } from "path";

// Since __dirname no longer exists with ESM, https://stackoverflow.com/a/50052194
import { dirname } from "path";
import { fileURLToPath } from "url";
export const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  iconsPath: join(__dirname, "dist"),
};
