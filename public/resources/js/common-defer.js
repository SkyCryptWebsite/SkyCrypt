function handleSubmit(submitEvent) {
  submitEvent.preventDefault();
  const formData = new FormData(submitEvent.srcElement);
  const urlSegments = formData.get("ign").trim().split("/");
  let error;
  switch (urlSegments.length) {
    case 2:
      if (!(urlSegments[1].match(/^([0-9a-fA-F]{32})$/) || urlSegments[1].match(/^[A-Z][a-z]+/))) {
        error = `"${urlSegments[1]}" is not a valid profile name or ID`;
        break;
      }
    case 1:
      if (
        urlSegments[0].match(
          /^([0-9a-fA-F]{8})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{4})-?([0-9a-fA-F]{12})$/
        )
      ) {
        urlSegments[0] = urlSegments[0].replace(/-/g, "");
      } else if (urlSegments[0].match(/^[\w ]{1,16}$/)) {
        urlSegments[0] = urlSegments[0].replace(/ /g, "_");
      } else {
        error = `"${urlSegments[0]}" is not a valid username or UUID`;
        break;
      }
      window.location.href = "/stats/" + urlSegments.join("/");
      return;
  }
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
document.querySelectorAll(".lookup-player").forEach((form) => {
  form.addEventListener("submit", handleSubmit);
});
