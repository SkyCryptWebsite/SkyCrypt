# How to update or add a new resource pack

1. Copy the resource pack files inside this folder
2. Add a `config.json` file at the root of the resource pack folder
3. The resourcepack folder must contain `pack.png` and `/assets/minecraft/mcpatcher/cit` folder
4. The `cit` folder will contain all our textures and `.properties` files that can be organized into sub-folders
5. Delete all extra files such as:
   - Armor models
   - Pets (currently not supported)
   - GUIs (except Heart of the Mountain)
   - Any other file outside the `cit` folder
6. Run `npm run start` once, it will generate all the animated textures (gifs) and normalize the other textures sizes

# Things that require manual update or changes

Some resource packs require some files to be changed in order to resolve some bugs.

- FurfSky Reborn
  - `cit/uielements/skyblock_menu/hotm/complete/fortunate.properties` remove color formatting from "nbt.display.Name" and comment "nbt.display.Lore" line.

# Examples

Example folder structure:

```text
.
└── public/
    ├── My_ResourcePack/
    │   ├── assets/
    │   │   └── minecraft/
    │   │       └── mcpatcher/
    │   │           └── cit/
    │   │               ├── texture.png
    │   │               ├── texture.properties
    │   │               └── ...
    │   ├── config.json
    │   └── pack.png
    ├── ...
    └── README.md
```

Example `config.json` file:

```js
{
  "id": "MY_RESOURCEPACK", // Unique identifier for the pack, doesn't change between versions
  "name": "My ResourcePack",
  "version": "v1.0.0",
  "author": "SkyCrypt Team",
  "url": "https://www.example.com/",
  "priority": 100 // Priority of the pack, used while generating the Default Pack
}
```
