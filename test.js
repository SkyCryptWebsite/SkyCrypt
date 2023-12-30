import fs from "fs";

try {
  const path = "public/resourcepacks/FurfSky_Reborn_1_7/assets/minecraft/mcpatcher/cit/equipment/armor";
  const armors = fs.readdirSync(path);
  for (const armorSet of armors) {
    let icons = [],
      iconPath = false;
    if (fs.existsSync(`${path}/${armorSet}/icons`)) {
      icons = fs.readdirSync(`${path}/${armorSet}/icons`);
    } else if (fs.existsSync(`${path}/${armorSet}/icon`)) {
      icons = fs.readdirSync(`${path}/${armorSet}/icon`);
      iconPath = true;
    } else {
      console.log("No icons found", armorSet);
    }

    for (const icon of icons) {
      if (icon.endsWith(".properties") === false) {
        continue;
      }

      const fileData = fs.readFileSync(`${path}/${armorSet}/${iconPath ? "icon" : "icons"}/${icon}`, "utf8");
      if (fileData.includes("nbt.ExtraAttributes.id=")) {
        continue;
      }

      console.log("Fixing", icon);
      const line = fileData.split("\n").at(-1);
    }
  }
} catch (e) {
  console.log(e);
}
