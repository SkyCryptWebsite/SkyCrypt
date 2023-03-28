/* eslint-disable @typescript-eslint/naming-convention */
import Benchmark from "benchmark";
import * as customResources from "../../src/custom-resources.js";
import * as itemHelper from "../../src/helper/item.js";

const testItemIds = [
  "ASPECT_OF_THE_END",
  "BONZO_STAFF",
  "SILENT_DEATH",
  "LIVID_DAGGER",
  "SHADOW_FURY",
  "HYPERION",

  "GOLD_PICKAXE",
  "TITANIUM_PICKAXE",

  "SKYBLOCK_MENU",
  "OIL_BARREL",
  "CORRUPTED_BAIT",
  "MAGMA_FISH_HAT",
  "ROGUE_SWORD",
  "MASTER_SKULL_TIER_9",
  "OPTICAL_LENS",
  "ZOMBIE_SOLDIER_CHESTPLATE",
];

const testItems = {};
const testTextureData = {};

const completeData = {};

const suite = new Benchmark.Suite("custom-resources: getTexture", {
  onCycle: (event) => {
    const itemId = event.target.name;
    const textureData = testTextureData[itemId];

    const itemCompleteData = {
      benchmark_hz: event.target.hz,
      hz_per_texture: event.target.hz / textureData.debug.processed_textures,
      processed_textures: textureData.debug.processed_textures,
    };

    console.log(event.target.toString());

    console.log(
      `Hertz per texture: %s hz (Processed textures: %s) \r\n`,
      itemCompleteData.hz_per_texture.toFixed(2),
      itemCompleteData.processed_textures
    );

    completeData[itemId] = itemCompleteData;
  },
  onComplete: () => {
    console.log("\r\n benchmark done! \r\n");

    console.table(completeData);

    console.log(
      `Average benchmark hertz: %s, Average hertz per texture: %s \r\n`,
      (
        Object.values(completeData).reduce((sum, { benchmark_hz }) => sum + benchmark_hz, 0) /
        Object.keys(completeData).length
      ).toFixed(2),
      (
        Object.values(completeData).reduce((sum, { hz_per_texture }) => sum + hz_per_texture, 0) /
        Object.keys(completeData).length
      ).toFixed(2)
    );

    process.exit();
  },
});

console.log("\r\n initiating custom resources \r\n");
await customResources.init();

console.log("\r\n gathering testing item data \r\n");
for (const itemId of testItemIds) {
  testItems[itemId] = await itemHelper.getItemData({ skyblockId: itemId });
}

for (const itemId of testItemIds) {
  const textureData = await customResources.getTexture(testItems[itemId], { debug: true });

  if (textureData == null) continue;

  testTextureData[itemId] = textureData;
  console.log("%s: %s", itemId, textureData?.pack.config.id);

  suite.add(
    itemId,
    async () => {
      await customResources.getTexture(testItems[itemId]);
    },
    { async: true }
  );
}

console.log("\r\n starting benchmarks \r\n");
suite.run();
