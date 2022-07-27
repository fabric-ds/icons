import { Window } from 'happy-dom'
import glob from 'glob'
import camelcase from 'camelcase'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const getDirname = (url) => dirname(fileURLToPath(url))
const pathRegex = /(?<size>\d+)\/(?<name>.*).svg/
export const getNameAndSize = (filepath) => filepath.match(pathRegex).groups
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)
export const pascalCase = str => capitalize(camelcase(str))
const getNames = ({ name, size }) => ({
  filename: `${name}-${size}.js`,
  exportName: pascalCase(`icon-${name}${size}`)
})

const __dirname = getDirname(import.meta.url)
export const getSVGs = () => glob.sync(join(__dirname, '../../dist/**/*.svg')).map(f => {
  const _svg = readFileSync(f, 'utf-8')
  try {
    const { size, name } = getNameAndSize(f)
    const svg = getSVG(_svg)
    return { svg, name, size, ...getNames({ name, size }) }
  } catch (err) { console.error(err) }
}).filter(Boolean)


export function getSVG(svg) {
  const el = getElement({ selector: 'svg', htmlString: svg })
  return { attrs: el.attributes, html: el.innerHTML }
}

export function getElement({ selector, htmlString }) {
  const window = new Window()
  window.document.body.innerHTML = htmlString
  return window.document.querySelector(selector)
}
