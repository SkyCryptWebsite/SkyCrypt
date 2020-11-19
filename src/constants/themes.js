module.exports = {
    themes: {

        /* Official Themes */

        "default": {
            name: "Default Theme",
            author: "SkyCrypt Team",
            official: true,
            images: {
                logo: "/resources/img/logo_square.png"
            }
        },
        "skylea": {
            name: "sky.lea.moe",
            author: "LeaPhant",
            official: true,
            images: {
                logo: "/resources/img/themes/skylea/logo_square.png",
                bg: "/resources/img/themes/skylea/bg.webp",
                bg_blur: "/resources/img/themes/skylea/bg_blur.webp"
            },
            backgrounds: {
                skillbar: {
                    type: "color",
                    color: "#850F4A"
                }
            },
            colors: {
                icon: "#A6145D",
                link: "#F94EA3",
                hover: "#F78DC2",
            }
        },

        /* Community Themes */

        "nightblue": {
            name: "Night Blue Theme",
            author: "8KCoffeeWizard",
            community: true,
            images: {
                logo: "/resources/img/themes/nightblue/logo_square.png",
                bg: "/resources/img/themes/nightblue/bg.webp",
                bg_blur: "/resources/img/themes/nightblue/bg_blur.webp"
            },
            backgrounds: {
                skillbar: {
                    type: "color",
                    color: "#3BB9FF"
                }
            },
            colors: {
                icon: "#3BB9FF",
                link: "#00FFFB",
                hover: "#0BAFCA",
            }
        },
        "sunrise": {
            name: "Sunrise Orange Theme",
            author: "rainbowcraft2",
            community: true,
            images: {
                logo: "/resources/img/themes/sunrise/logo_square.png",
                bg: "/resources/img/themes/sunrise/bg.webp",
                bg_blur: "/resources/img/themes/sunrise/bg_blur.webp"
            },
            backgrounds: {
                skillbar: {
                    type: "color",
                    color: "#f2694e"
                }
            },
            colors: {
                link: "#F2694E",
                icon: "#F2694E",
                hover: "#ff9d57",
            }
        },
        "draconic": {
            name: "Draconic Purple Theme",
            author: "rainbowcraft2",
            community: true,
            images: {
                logo: "/resources/img/themes/draconic/logo_square.png",
                bg: "/resources/img/themes/draconic/bg.webp",
                bg_blur: "/resources/img/themes/draconic/bg_blur.webp"
            },
            backgrounds: {
                skillbar: {
                    type: "color",
                    color: "#ba5fde"
                }
            },
            colors: {
                link: "#7652b1",
                icon: "#ba5fde",
                hover: "#ba5fde",
            }
        },
        "candycane": {
            name: "Candy Cane Theme",
            author: "Cookie_Wookie_7",
            community: true,
            light: true,
            images: {
                logo: "/resources/img/themes/candycane/logo_square.svg",
                bg: "/resources/img/themes/candycane/bg.webp",
                bg_blur: "/resources/img/themes/candycane/bg_blur.webp"
            },
            backgrounds: {
                skillbar: {
                    type: "stripes",
                    angle: "45deg",
                    colors: ["#ff3939", "#ffffff"],
                    width: 10
                },
                maxedbar: {
                    type: "stripes",
                    angle: "45deg",
                    colors: ["#ff4e2a", "#fdbb3c"],
                    width: 10
                }
            },
            colors: {
                icon: "#CA0000",
                link: "#EA0000",
                hover: "#EF0000",
            }
        }
    }
}