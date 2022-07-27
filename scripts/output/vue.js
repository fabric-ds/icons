import { mkdirSync, writeFileSync } from 'node:fs'
import { join as joinPath } from 'node:path'
import { getSVGs, getDirname } from './util.js'
import chalk from 'chalk'

const __dirname = getDirname(import.meta.url)
const icons = []
const basepath = joinPath(__dirname, '../../vue/')
mkdirSync(basepath, { recursive: true })

getSVGs().forEach(({ svg, filename, exportName }) => {
  const attrs = Array.from(svg.attrs).map(attr => attr.name + `: ` + `'` + attr.value + `'`)
  const output = [
    `import { h } from 'vue'`,
    `export default (_, { attrs }) => h('svg', { ${attrs.join(', ')}, innerHTML: '${svg.html}', ...attrs })`
  ].join('\n')
  const path = joinPath(basepath, filename)
  writeFileSync(path, output, 'utf-8')
  icons.push({ exportName, filename })
})
console.log(`${chalk.green('vue')}: Wrote ${chalk.yellow(icons.length)} icon files`)

const indexFile = icons.map(({ exportName, filename }) => `export { default as ${exportName} } from './${filename}'`).join('\n')
const indexFilename = joinPath(basepath, 'index.js')
writeFileSync(indexFilename, indexFile, 'utf-8')
console.log(`${chalk.green('vue')}: Wrote ${chalk.yellow('index')} file`)
