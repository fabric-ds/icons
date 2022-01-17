#!/usr/bin/env node

import SVGO from "svgo";
import glob from "glob";
import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import { nanoid } from "nanoid";

import { __dirname } from "../index.js";

const SRC_DIR = path.join(__dirname, "raw");
const DIST_DIR = path.join(__dirname, "dist");

const svgo = () =>
  new SVGO({
    plugins: [
      {
        convertColors: {
          currentColor: true,
        },
      },
      {
        removeViewBox: false,
      },
      {
        sortAttrs: true,
      },
      {
        // add unique prefixes to the ids
        prefixIds: {
          delim: "",
          prefix: nanoid(5),
        },
      },
    ],
  });

const files = glob.sync(`${SRC_DIR}/**/*.svg`);

files.forEach(async (filePath) => {
  try {
    const rawData = await fs.readFile(filePath, "utf-8");

    const prevFileSize = Buffer.byteLength(rawData, "utf8");

    const { data: optimizedData } = await svgo().optimize(rawData);

    const optimizedFileSize = Buffer.byteLength(optimizedData, "utf8");

    const fileName = path.basename(filePath);
    const iconSize = getIconSize(filePath);

    console.log(`\n${iconSize}/${fileName}:`);
    printProfitInfo(prevFileSize, optimizedFileSize);

    const outputPath = path.join(DIST_DIR, iconSize, fileName);

    fs.outputFile(outputPath, optimizedData, "utf8");
  } catch (err) {
    console.error(err);
  }
});

/**
 * Copied from https://github.com/svg/svgo/blob/fdf9236d12b861cee926d7ba3f00284ff7884eab/lib/svgo/coa.js#L512
 */
function printProfitInfo(inBytes, outBytes) {
  var profitPercents = 100 - (outBytes * 100) / inBytes;

  console.log(
    Math.round((inBytes / 1024) * 1000) / 1000 +
      " KiB" +
      (profitPercents < 0 ? " + " : " - ") +
      chalk.green(Math.abs(Math.round(profitPercents * 10) / 10) + "%") +
      " = " +
      Math.round((outBytes / 1024) * 1000) / 1000 +
      " KiB"
  );
}

function getIconSize(filePath) {
  const dirname = path.dirname(filePath);
  const dirs = dirname.split("/");
  return dirs[dirs.length - 1];
}
