/* global tippy:readonly */

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
