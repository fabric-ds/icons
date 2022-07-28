import path from "path";
export const basedir = path.dirname(new URL(import.meta.url).pathname);
export const iconsPath = path.join(basedir, "dist");
