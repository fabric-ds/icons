import glob from "glob";
import camelcase from "camelcase";
import { readFileSync, writeFileSync } from "fs";
import { JSDOM } from "jsdom";

const icons = [];
const pathRegex = /(?<size>\d+)\/(?<name>.*).svg/;
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const files = glob.sync("./dist/**/*.svg");
files.forEach((f) => {
  const svg = readFileSync(f, "utf-8");
  if (!svg) return;
  try {
    const { size, name } = f.match(pathRegex).groups;
    const dom = new JSDOM(svg).window.document;
    const el = dom.querySelector("svg");
    // Might need to wrap the name in quotes as well in the future or just use JSON.stringify on this
    const attrs = Array.from(el.attributes).map(
      (attr) => attr.name + `: ` + `'` + attr.value + `'`
    );
    const output = [
      `import React from 'react';`,
      `export default (attrs) => React.createElement('svg', { ${attrs.join(
        ", "
      )}, dangerouslySetInnerHTML: { __html: '${
        el.innerHTML
      }' }, ...attrs, });`,
    ].join("\n");
    const filename = `${name}-${size}.js`;
    const path = "./react/" + filename;
    writeFileSync(path, output, "utf-8");
    icons.push({ name, size, filename });
  } catch (err) {
    console.error(err);
  }
});

const indexFile = icons
  .map(
    ({ name, size, filename }) =>
      `export { default as ${capitalize(
        camelcase("icon-" + name)
      )}${size} } from './${filename}'`
  )
  .join("\n");
writeFileSync("./react/index.js", indexFile, "utf-8");
