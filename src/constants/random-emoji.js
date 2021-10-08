const emojis = ["🥕", "🍣", "🍦", "🧁", "🌈", "🎵", "✨", "🎈"];

export function randomEmoji() {
  return emojis[Math.floor(Math.random() * emojis.length)];
}
