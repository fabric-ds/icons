# Fabric Icons

The icon set for Fabric, imported from the [Figma project](https://www.figma.com/file/pY4zC5fnUv7CPjwSrJV9nT/).

**Note that the icons in this repository should never be used directly, as they aren't optimized.**

## Updating the icons

Icons should never be added or edited manually in this repository, as the source of truth is in [Figma](https://www.figma.com/file/pY4zC5fnUv7CPjwSrJV9nT/).

### Figma access token

If you are running the import script for the first time, it will prompt your for a [Figma access token](https://www.figma.com/developers/api#access-tokens). The token is is required to access Figma's API. It can be generated on your Figma account settings page.

The import script may store the token to a local file, so you won't have to supply the token again on subsequent runs.

### Import script

To update the icons, run the following script. If it has a valid Figma access token (see above), it will proceed to download all the icons as SVG files.

```sh
./scripts/figma-import.js
```

### Local preview

You can open a local preview of the icons. Use this to verify that the icons looks as they should. Run the following command.

```sh
npm run start
```

### Publishing

If everything looks correct, publish the changes.

```sh
npm publish
```

```sh
git push --follow-tags
```

## Troubleshooting

### Auth

If the scripts authentication issues, you could try to create a new access token and delete the local file `.FIGMA_TOKEN` before running the script again.

### Figma project structure

The script is probably not resilient to changes in the structure of the Figma project. Changes there will probably require an update of the import script.
