function searchValueContainsReplacedWords(searchValue, replaceValue, replacedWords) {
  return Array.from(replacedWords).some((word) => word.replace(searchValue, replaceValue) !== word);
}

export class Word {
  word;
  replacedWords;

  constructor(word) {
    this.word = word.trim();
    this.replacedWords = new Set();
  }

  replace(searchValue, replaceValue, replaceReplacedWords = false) {
    if (!replaceReplacedWords && searchValueContainsReplacedWords(searchValue, replaceValue, this.replacedWords)) {
      return this;
    }

    const replacingWord = this.word.replace(searchValue, replaceValue).trim();
    const matchArray = this.word.match(searchValue);
    const replacedWords = matchArray !== null ? Array.from(matchArray).map((x) => x.replace(x, replaceValue)) : [];
    if (replacingWord !== this.word) {
      for (const word of replacedWords) {
        this.replacedWords.add(word);
      }

      this.word = replacingWord;
    }

    return this;
  }

  toString() {
    return this.word;
  }
}
