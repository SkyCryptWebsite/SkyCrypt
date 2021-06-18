declare const page: string;

declare namespace extra {
  const favoriteUUIDs: string[];
  const isFoolsDay: boolean;
  const cacheOnly: boolean;
  const packs: Pack[];
  const themes: {
    [key: string]: Theme;
  };
}

interface Pack {
  id: string;
  name: string;
  author: string;
  url: string;
}

interface Theme {
  name: string;
  author: string;
  official?: true;
  community?: true;
  light?: true;
  enchanted_glint?: string;
  images?: {
    [key: string]: string;
  };
  backgrounds?: {
    [key: string]:
      | {
          type: "color";
          color: string;
        }
      | {
          type: "stripes";
          angle: string;
          colors: string[];
          width: number;
        };
  };
  colors?: {
    [key: string]: string;
  };
}
