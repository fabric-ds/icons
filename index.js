import path from "path";
export const __dirname = path.dirname(new URL(import.meta.url).pathname);
export const iconsPath = path.join(__dirname, "dist");
