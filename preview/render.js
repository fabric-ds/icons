const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');
const nunjucks = require('nunjucks');

const svgPaths = glob.sync(`./dist/**/*.svg`);

const icons = svgPaths.map((svgPath) => {
  const data = fs.readFileSync(svgPath, 'utf-8');

  return {
    name: path.parse(svgPath).name,
    svg: data,
    iconSize: getIconSize(svgPath),
  };
});

// Group the icons by size
const iconsBySize = {};
for (const icon of icons) {
  const array = iconsBySize[icon.iconSize] || [];
  array.push(icon);
  iconsBySize[icon.iconSize] = array;
}

fs.writeFileSync(
  './preview/index.html',
  nunjucks.render(path.join(__dirname, 'template.njk'), {
    iconsBySize,
  })
);

function getIconSize(filePath) {
  const dirname = path.dirname(filePath);
  const dirs = dirname.split('/');
  return dirs[dirs.length - 1];
}
