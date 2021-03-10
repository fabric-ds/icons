#!/usr/bin/env node
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const prompts = require('prompts');
const slugify = require('@sindresorhus/slugify')



// The Figma project where we can find our icons
const FIGMA_PROJECT_ID = '1qkEGDQWaftkOL7C360qVD';

// The id the of the canvas where we can find the icons
// const CANVAS_ID = '31:2';

// Where we store the Figma token
const FIGMA_TOKEN_PATH = path.join(__dirname, '../', '.FIGMA_TOKEN');

(async function main() {
  const spinner = ora(
    'Reading Figma access token from ' + FIGMA_TOKEN_PATH
  ).start();

  let figmaToken = await readTokenFromDisk();

  if (figmaToken) {
    spinner.succeed('Using Figma access token from ' + FIGMA_TOKEN_PATH);
  } else {
    spinner.warn('No Figma access token found');

    const tokenPrompt = await prompts({
      type: 'text',
      name: 'figmaToken',
      message:
        'Enter your Figma access token (https://www.figma.com/developers/api#access-tokens)',
    });

    figmaToken = tokenPrompt.figmaToken;

    const { saveToken } = await prompts({
      type: 'confirm',
      name: 'saveToken',
      message: 'Would you like to save the token?',
    });

    if (saveToken) {
      await writeTokenToDisk(figmaToken);
      spinner.succeed('Saved token to ' + FIGMA_TOKEN_PATH);
    }
  }

  spinner.start('Loading Figma project');

  let components;
  try {
    components = await fetchComponents(figmaToken);
    spinner.succeed(`Loaded Figma components`);
  } catch (e) {
    spinner.fail('Unable to load Figma components: ' + e.message);
    return;
  }

  let icons;
  try {
    spinner.start('Parsing Figma components');
    icons = processComponents(components);
    spinner.succeed(`Parsed ${icons.length} components into icons`);
  } catch (e) {
    spinner.fail('Unable to parse icons from Figma components: ' + e.message);
    return;
  }

  let urls;
  try {
    spinner.start(`Found ${icons.length} icons. Getting download URLs`);
    urls = await fetchImageUrls(icons, figmaToken);
    spinner.succeed();
  } catch (e) {
    spinner.fail('Unable to get icon URLs: ' + e.message);
    return;
  }

  let count = 0;
  spinner.start(`Downloading icons: ${count}/${icons.length}`);

  await Promise.all(
    Object.entries(urls.images).map(async ([id, url]) => {
      const iconName = icons.find((i) => i.id === id).name;

      await downloadSvgIcon({ iconName, url });

      count = count + 1;
      spinner.text = `Downloading icons: ${count}/${icons.length}`;
    })
  );

  spinner.succeed();

  spinner.succeed(`Sucessfully downloaded ${icons.length} icons!`);
})();

/**
 * Get the Figma project
 */
async function fetchComponents(figmaToken) {
  const res = await fetch(
    `https://api.figma.com/v1/files/${FIGMA_PROJECT_ID}/components`,
    {
      headers: {
        'X-FIGMA-TOKEN': figmaToken,
      },
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.err);
  }

  return json.meta.components;
}

/**
 * Get image URLs for the icons
 *
 * @returns { images: {[id]: string}};
 */
async function fetchImageUrls(icons, figmaToken) {
  const url = new URL(`https://api.figma.com/v1/images/${FIGMA_PROJECT_ID}/`);

  url.searchParams.set('ids', icons.map(i => i.id).join(','));
  url.searchParams.set('format', 'svg');

  const res = await fetch(url, {
    headers: {
      'X-FIGMA-TOKEN': figmaToken,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.err);
  }

  return json;
}

/**
 * Get the SVG icon
 */
async function downloadSvgIcon({ iconName, url }) {
  const res = await fetch(url);
  const svg = await res.text();

  // the icon name has the size of the icon included, which we don't want

  const { size, name } = sizeAndName(iconName);

  // this avoids downloading misnamed icons with no name
  // technically this makes the 'count' be off up above, but meh
  if (!name) return

  const path = `${__dirname}/../raw/${size}/${name}.svg`;

  return fs.outputFile(path, svg, 'utf8');
}

const hasNumbers = /\d/
const isCompound = /Size/
const correctSingleFormat = /\d\d\//
const poorlyNamedIcons = comp => {
  if (comp.containing_frame?.name?.match(hasNumbers)) {
    console.log("DISCARDING", comp.containing_frame.name)
    return false
  }
  if (!comp.name.match(isCompound)) {
    if (!comp.name.match(correctSingleFormat) || comp.name.split('/')[1].match(hasNumbers)) {
      console.log("DISCARDING", comp.name)
      return false
    }
  }
  return true
}
const parseGroupName = comp => comp.name.replace('Size=', '') + '-' + slugify(comp.containing_frame.name)
const parseSingleName = comp => slugify(comp.name)
/**
 * Get the icons in the Figma Project
 *
 * @returns Array<{id: string, name: string}>
 */
function processComponents(components) {
  // FIXME need to filter here to start
  return components.filter(poorlyNamedIcons).map(c => ({
    id: c.node_id,
    name: c.containing_frame.name ? parseGroupName(c) : parseSingleName(c)
  }))
}

/**
 * @param {String} iconName
 */
function sizeAndName(iconName) {
  const [size, ...rest] = iconName.split('-');

  let name = rest.join('-');

  name = name.toLowerCase();

  return { size, name };
}

function writeTokenToDisk(token) {
  return fs.outputFile(FIGMA_TOKEN_PATH, token, 'utf8');
}

/**
 * @returns {String} token
 */
async function readTokenFromDisk() {
  try {
    const token = await fs.readFile(FIGMA_TOKEN_PATH, 'utf8');
    return token;
  } catch {
    return '';
  }
}
