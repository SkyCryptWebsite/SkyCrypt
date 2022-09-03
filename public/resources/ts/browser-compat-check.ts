import Bowser from "bowser";

const supportedIOSVersionNumber = 15.4;
const iOSHelpPage = "https://support.apple.com/en-us/HT204204";

const browsers: {
  [key: string]: {
    version: string;
    help: string;
    androidPackage?: string;
  };
} = {
  safari: {
    version: "15.4",
    help: "https://support.apple.com/en-us/HT204416",
  },
  chrome: {
    version: "88",
    help: "https://support.google.com/chrome/answer/95414",
    androidPackage: "com.android.chrome",
  },
  edge: {
    version: "88",
    help: "https://support.microsoft.com/en-us/topic/microsoft-edge-update-settings-af8aaca2-1b69-4870-94fe-18822dbb7ef1",
    androidPackage: "com.microsoft.emmx",
  },
  firefox: {
    version: "103",
    help: "https://support.mozilla.org/kb/update-firefox-latest-release",
    androidPackage: "org.mozilla.firefox",
  },
};

const bowser = Bowser.getParser(window.navigator.userAgent);

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function generatePopup(name: string) {
  if (sessionStorage.getItem("hide update warning")) {
    return;
  }

  const browser: { help: string; androidPackage?: string } = name == "iOS" ? { help: iOSHelpPage } : browsers[name];
  const wrapper = document.createElement("div");
  wrapper.className = "update-popup-wrapper";

  const popup = document.createElement("div");
  popup.className = "update-popup";
  const header = document.createElement("h2");
  header.innerHTML = "Outdated " + (name == "iOS" ? "iOS" : capitalizeFirstLetter(name)) + "!";
  popup.appendChild(header);
  const message = document.createElement("p");
  message.innerHTML = (name == "iOS" ? "Update iOS" : "Update your browser") + " for the best SkyCrypt experience.";
  popup.appendChild(message);

  const buttonRow = document.createElement("div");
  buttonRow.className = "button-row";

  const close = document.createElement("button");
  close.innerHTML = "close";
  close.onclick = function () {
    sessionStorage.setItem("hide update warning", "true");
    wrapper.remove();
  };
  buttonRow.appendChild(close);

  const update = document.createElement("a");
  if (bowser.is("android") && browser.androidPackage) {
    update.href = "https://play.google.com/store/apps/details?id=" + browser.androidPackage;
    update.innerHTML = "update now";
  } else {
    update.href = browser.help;
    update.innerHTML = "show me how";
  }
  update.target = "_blank";
  update.rel = "noreferrer";
  buttonRow.appendChild(update);

  popup.appendChild(buttonRow);

  wrapper.appendChild(popup);

  document.body.appendChild(wrapper);
  update.focus();
}

if (bowser.is("iOS")) {
  const iOSVersionNumber = parseFloat(bowser.getOSVersion().split(".").slice(0, 2).join("."));

  if (iOSVersionNumber < supportedIOSVersionNumber) {
    generatePopup("iOS");
  }
} else {
  for (const name in browsers) {
    const checkTree: Bowser.Parser.checkTree = {};
    checkTree[name] = "<" + browsers[name].version;

    if (bowser.satisfies(checkTree)) {
      generatePopup(name);
    }
  }
}
