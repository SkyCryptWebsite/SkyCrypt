const emojis = ["🥕", "🍣", "🍦", "🧁", "🌈", "🎵", "✨", "🎈"];

module.exports = function () {
    return emojis[Math.floor(Math.random() * emojis.length)];
};
