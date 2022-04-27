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

    const className = `${capitalize(camelcase("icon-" + name))}${size}`;

    const output = [
        `import { LitElement, html } from 'lit';`,
        `import { unsafeHTML } from 'lit/directives/unsafe-html.js';`,
        `const icon = \`${el.innerHTML}\`;`,
        `class ${className} extends LitElement {`,
        `  get attrs() {`,
        `    const attrs = { ${attrs.join(', ')} };`,
        `    Array.from(this.attributes).forEach(({ nodeName, nodeValue }) => attrs[nodeName] = nodeValue);`,
        `    return Object.entries(attrs).map(([k, v]) => \`\${k}="\${v}"\`).join(' ');`,
        `  }`,
        `  render() { return html\`\${unsafeHTML(\`<svg \${this.attrs}>\${icon}</svg>\`)}\`; }`,
        `}`,
        `if (!customElements.get('f-icon-${name}${size}', ${className})) {`,
        `  customElements.define('f-icon-${name}${size}', ${className})`,
        `}`,
    ].join("\n");
    const filename = `${name}-${size}.js`;
    const path = "./elements/" + filename;
    writeFileSync(path, output, "utf-8");
    icons.push({ name, size, filename });
  } catch (err) {
    console.error(err);
  }
});

const indexFile = icons
  .map(
    ({ name, size, filename }) =>
      `import from './${filename}'`
  )
  .join("\n");
writeFileSync("./elements/index.js", indexFile, "utf-8");
