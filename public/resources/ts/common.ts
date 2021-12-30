{
  /**
   * checks if the scrollbar has a width and sets the style-scrollbar class accordingly
   */
  window.setTimeout(() => {
    const outerDiv = document.createElement("div");
    outerDiv.style.position = "fixed";
    const innerDiv = document.createElement("div");
    innerDiv.style.overflowY = "scroll";
    outerDiv.appendChild(innerDiv);
    document.body.appendChild(outerDiv);
    if (outerDiv.clientWidth > 0) {
      // desktop style scrollbars
      document.documentElement.classList.add("style-scrollbar");
    } else {
      // mobile style scrollbars
      document.documentElement.classList.remove("style-scrollbar");
    }
  });

  // eslint-disable-next-line deprecation/deprecation
  const platform = navigator.platform ?? navigator.userAgentData?.platform ?? "unknown";
  const iOS = ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(platform);

  if (iOS) {
    const div = document.createElement("div");
    div.id = "status-bar";
    document.body.prepend(div);
  }

  if (extra.cacheOnly) {
    document.documentElement.classList.add("cache-only");
  }
}
