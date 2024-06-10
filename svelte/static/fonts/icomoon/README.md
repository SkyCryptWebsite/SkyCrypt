# SkyCrypt custom icon font

This font is loaded on top of the normal fonts and replaces only specific characters (icons such as the item stars, dungeon master stars) with svg icons.

## How to edit

You can import _selection.json_ back to the IcoMoon app using the _Import Icons_ button (or via Main Menu → Manage Projects) to retrieve your icon selection.

## How to add new icons/characters

First off find the UNICODE character you want to edit, you can use [this website](https://www.babelstone.co.uk/Unicode/whatisit.html).

Then import the icomoon font in the app and add a new character by dropping an svg in the selection. At this point go to "Generate Font" and make sure to associate your newly imported icon to the correct character.

If you want you can resize the icon:

- for dungeon stars and dungeon master stars I scaled down 10 times the icons (by using IcoMoon GUI, clicking 10 times the "scale down" button) and then aligned the svg bottom center
- for skill icons I kept their original size and centered them middle center.

Download the generated SVG font, replace the files in the `/public/resources/fonts/icomoon/` directory:

- Font files
- selection.json

Update the `_fonts.scss` file:

- Bump the cachebusting version (ex: `?v2` -> `?v3`)
- Add the UNICODE characters to the list in the css property `unicode-range`

And you are done!
