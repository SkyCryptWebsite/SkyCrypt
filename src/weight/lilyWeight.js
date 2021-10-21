const credentials = require("../../credentials.json")
const lilyWeight = require("lilyweight")(credentials.hypixel_api_key);

module.exports = {
    calculateWeight: async (uuid) => {
        const weight = await lilyWeight.getWeight(uuid);
        return weight;
    }
};