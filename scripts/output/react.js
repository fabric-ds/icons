import { mkdirSync, writeFileSync } from 'node:fs'
import { join as joinPath } from 'node:path'
import { getSVGs, getDirname } from './util.js'
import chalk from 'chalk'

const __dirname = getDirname(import.meta.url)
const icons = []
const basepath = joinPath(__dirname, '../../react/')
mkdirSync(basepath, { recursive: true })

getSVGs().forEach(({ svg, filename, exportName }) => {
  const attrs = Array.from(svg.attrs).map(attr => attr.name + `: ` + `'` + attr.value + `'`)
  const output = [
    `import React from 'react';`,
    `export const ${exportName} = (attrs) => React.createElement('svg', { ${attrs.join(", ")}, dangerouslySetInnerHTML: { __html: '${svg.html}' }, ...attrs, });`,
  ].join("\n");
  const path = joinPath(basepath, filename)
  writeFileSync(path, output, 'utf-8')
  icons.push({ exportName, filename })
})
console.log(`${chalk.cyan('react')}: Wrote ${chalk.yellow(icons.length)} icon files`)

const indexFile = icons.map(({ filename }) => `export * from './${filename}'`) .join("\n");
const indexFilename = joinPath(basepath, 'index.js')
writeFileSync(indexFilename, indexFile, 'utf-8')
console.log(`${chalk.cyan('react')}: Wrote ${chalk.yellow('index')} file`)
