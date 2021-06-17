/* global tippy:readonly, loadTheme:readonly, page:readonly */

/**
 * @param {string} url a url to be validated
 *
 * @throws {string} an error message
 *
 * @returns {string} a valid url
 */
function validateURL(url) {
  const urlSegments = url.trim().split("/");
  if (urlSegments.length < 1) {
    throw "please enter a Minecraft username or UUID";
  } else if (urlSegments.length > 2) {
    throw `"${url}" has too many "/"`;
  } else {
    if (urlSegments.length === 2) {
      if (urlSegments[1].match(/^[A-Za-z]+/)) {
        urlSegments[1] = urlSegments[1].charAt(0).toUpperCase() + urlSegments[1].substr(1).toLowerCase();
      } else if (!urlSegments[1].match(/^([0-9a-fA-F]{32})$/)) {
        throw `"${urlSegments[1]}" is not a valid profile name or ID`;
      }
    }
    if (
      urlSegments[0].match(
        /^([0-9a-fA-F]{8})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{12})$/
      )
    ) {
      urlSegments[0] = urlSegments[0].replaceAll("-", "");
    } else if (urlSegments[0].match(/^[\w ]{1,16}$/)) {
      urlSegments[0] = urlSegments[0].replace(" ", "_");
    } else {
      throw `"${urlSegments[0]}" is not a valid username or UUID`;
    }
    return "/stats/" + urlSegments.join("/");
  }
}

function handleSubmit(submitEvent) {
  submitEvent.preventDefault();
  const formData = new FormData(submitEvent.srcElement);
  try {
    window.location.href = validateURL(formData.get("ign"));
  } catch (error) {
    let errorTip = tippy(submitEvent.srcElement.querySelector("input"), {
      trigger: "manual",
      content: error || "please enter a valid Minecraft username or UUID",
    });
    errorTip.show();
    setTimeout(() => {
      errorTip.hide();
      setTimeout(() => {
        errorTip.destroy();
      }, 500);
    }, 1500);
  }
}

document.querySelectorAll(".lookup-player").forEach((form) => {
  form.addEventListener("submit", handleSubmit);
});

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; SameSite=Lax; path=/";
}

function eraseCookie(name) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

const expanders = document.querySelectorAll(".expander");
for (const expander of expanders) {
  expander.addEventListener("click", () => {
    for (const otherExpander of expanders) {
      if (otherExpander != expander) {
        otherExpander.setAttribute("aria-expanded", false);
      }
    }
    expander.setAttribute("aria-expanded", expander.getAttribute("aria-expanded") != "true");
  });
  const focusOutHandler = () => {
    setTimeout(() => {
      if (
        document.activeElement != document.body &&
        document.activeElement != expander &&
        !expander.nextElementSibling.contains(document.activeElement)
      ) {
        expander.setAttribute("aria-expanded", false);
      }
    });
  };
  expander.addEventListener("focusout", focusOutHandler);
  expander.nextElementSibling.addEventListener("focusout", focusOutHandler);
}

document.querySelectorAll('#packs-box button[name="pack"]').forEach((element) => {
  element.addEventListener("click", (event) => {
    const newPack = event.target.value;
    if (newPack) {
      setCookie("pack", newPack, 365);
    } else {
      eraseCookie("pack");
    }

    const oldElement = document.querySelector(`#packs-box button[name="pack"][aria-selected]`);
    oldElement.removeAttribute("disabled");
    oldElement.removeAttribute("aria-selected");

    if (page == "stats") {
      event.target.classList.add("loading");
      sessionStorage.setItem("open packs", true);
      window.location.reload();
    } else {
      event.target.setAttribute("aria-selected", "");
      event.target.setAttribute("disabled", "");
    }
  });
});

document.querySelector("#themes-box").addEventListener("change", (event) => {
  const newTheme = event.target.value;
  localStorage.setItem("currentTheme", newTheme);
  loadTheme(newTheme);
});

window.addEventListener("storage", (event) => {
  if (event.key === "currentTheme") {
    setCheckedTheme(event.newValue);
    loadTheme(event.newValue);
  }
});

function setCheckedTheme(theme) {
  document.querySelector(`#themes-box input[value="${theme}"]`).checked = true;
}

setCheckedTheme(localStorage.getItem("currentTheme"));

tippy("*[data-tippy-content]", {
  boundary: "window",
});

const prideFlag = document.querySelector(".pride-flag");
const prideFlags = ["rainbow", "trans", "lesbian", "bi", "pan", "nb", "ace", "genderfluid", "logo"];

let currentFlag = prideFlags.length - 1;

if (localStorage.getItem("currentFlag")) {
  currentFlag = parseInt(localStorage.getItem("currentFlag"));
  prideFlag.className = "pride-flag " + prideFlags[currentFlag];
}

prideFlag.addEventListener("click", function () {
  currentFlag++;

  if (currentFlag > prideFlags.length - 1) currentFlag = 0;

  localStorage.setItem("currentFlag", currentFlag);
  prideFlag.className = "pride-flag " + prideFlags[currentFlag];
});
