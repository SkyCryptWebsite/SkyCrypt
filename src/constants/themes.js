module.exports = {
  themes: {
    /* Official Themes */

    default: {
      name: "Default Theme",
      author: "SkyCrypt Team",
      official: true,
    },
    light: {
      name: "Default Light Theme",
      author: "SkyCrypt Team",
      official: true,
      light: true,
      images: {
        bg: "/resources/img/themes/light/bg.webp",
        bg_blur: "/resources/img/themes/light/bg_blur.webp",
      },
      backgrounds: {
        skillbar: {
          type: "color",
          color: "#56d34d",
        },
        maxedbar: {
          type: "color",
          color: "#fdbb3c",
        },
      },
      colors: {
        logo: "#08a53d",
        icon: "#00b52f",
        link: "#05d245",
        hover: "#0bea51",
        maxed: "#DD980E",
        gold: "#c58000",
      },
    },
    skylea: {
      name: "sky.lea.moe",
      author: "LeaPhant",
      official: true,
      enchanted_glint: "/resources/img/enchanted-glint-legacy.png",
      images: {
        bg: "/resources/img/themes/skylea/bg.webp",
        bg_blur: "/resources/img/themes/skylea/bg_blur.webp",
      },
      backgrounds: {
        skillbar: {
          type: "color",
          color: "#850F4A",
        },
      },
      colors: {
        logo: "#f03c96",
        icon: "#A6145D",
        link: "#F94EA3",
        hover: "#F78DC2",
      },
    },

    /* Community Themes */

    nightblue: {
      name: "Night Blue Theme",
      author: "8KCoffeeWizard",
      community: true,
      images: {
        bg: "/resources/img/themes/nightblue/bg.webp",
        bg_blur: "/resources/img/themes/nightblue/bg_blur.webp",
      },
      backgrounds: {
        skillbar: {
          type: "color",
          color: "#3BB9FF",
        },
      },
      colors: {
        logo: "#0b8ada",
        icon: "#3BB9FF",
        link: "#00FFFB",
        hover: "#0BAFCA",
      },
    },
    sunrise: {
      name: "Sunrise Orange Theme",
      author: "rainbowcraft2",
      community: true,
      images: {
        bg: "/resources/img/themes/sunrise/bg.webp",
        bg_blur: "/resources/img/themes/sunrise/bg_blur.webp",
      },
      backgrounds: {
        skillbar: {
          type: "color",
          color: "#f2694e",
        },
      },
      colors: {
        logo: "#f5694c",
        link: "#F2694E",
        icon: "#F2694E",
        hover: "#ff9d57",
      },
    },
    draconic: {
      name: "Draconic Purple Theme",
      author: "rainbowcraft2",
      community: true,
      images: {
        bg: "/resources/img/themes/draconic/bg.webp",
        bg_blur: "/resources/img/themes/draconic/bg_blur.webp",
      },
      backgrounds: {
        skillbar: {
          type: "color",
          color: "#ba5fde",
        },
      },
      colors: {
        logo: "#a956c8",
        link: "#7652b1",
        icon: "#ba5fde",
        hover: "#ba5fde",
      },
    },
    candycane: {
      name: "Candy Cane Theme",
      author: "Cookie_Wookie_7",
      community: true,
      light: true,
      images: {
        bg: "/resources/img/themes/candycane/bg.webp",
        bg_blur: "/resources/img/themes/candycane/bg_blur.webp",
      },
      backgrounds: {
        skillbar: {
          type: "stripes",
          angle: "45deg",
          colors: ["#ff5555", "#ffffff"],
          width: 10,
        },
        maxedbar: {
          type: "stripes",
          angle: "45deg",
          colors: ["#ff4e2a", "#fdbb3c"],
          width: 10,
        },
      },
      colors: {
        logo: "#cc0000",
        icon: "#CA0000",
        link: "#ce0000",
        hover: "#EB0000",
        maxed: "#DD980E",
        gold: "#c58000",
      },
    },
    bloodyscorpion: {
      name: "Bloody Scorpion Theme",
      author: "Gozuk12",
      community: true,
      images: {
        bg: "/resources/img/themes/bloodyscorpion/bg.webp",
        bg_blur: "/resources/img/themes/bloodyscorpion/bg_blur.webp",
      },
      backgrounds: {
        skillbar: {
          type: "color",
          color: "#EF325C",
        },
        maxedbar: {
          type: "linear-gradient",
          angle: "45deg",
          colors: ["#89216B", "#DA4453"],
          width: 10,
        },
      },
      colors: {
        logo: "#ED1444",
        icon: "#ED1444",
        link: "#38ef7d",
        hover: "#ED1444",
        maxed: "#89216B",
        gold: "#db68ba",
      },
    },

    /* Hidden Themes */

    /* I have no idea if this theme is mentally sane so lmao */
    warpwing: {
      name: "Forest Walk",
      author: "WarpWing",
      community: true,
      hidden: true,
      images: {
        bg: "https://cdn.discordapp.com/attachments/713278398830477353/744929704611676221/farming_2.png",
        bg_blur: "https://cdn.discordapp.com/attachments/713278398830477353/744929704611676221/farming_2.png",
      },
      backgrounds: {
        skillbar: {
          type: "color",
          color: "#00aabb",
        },
      },
      colors: {
        logo: "#117d87",
        icon: "#00aabb",
        link: "#00aabb",
        hover: "#00aabb",
      },
    },
  },
};
