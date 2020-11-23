document.addEventListener("DOMContentLoaded", function () {
    let statContainers = document.querySelectorAll(
        ".stat-container[data-stat]"
    );
    let wrapperHeight = document.querySelector("#wrapper").offsetHeight;

    let positionY = {};

    let navBarSticky = new Sticky("#nav_bar");

    function updateStatsPositions() {
        [].forEach.call(statContainers, function (statContainer) {
            positionY[statContainer.getAttribute("data-stat")] =
                statContainer.offsetTop;
        });

        navBarSticky = new Sticky("#nav_bar");
    }

    updateStatsPositions();

    let updateTab = false;
    let updateTabLock = false;

    function updateActiveTab() {
        if (!updateTab) return false;

        let rectYs = [];
        let activeIndex = 0;
        let activeY = -Infinity;
        let activeStatContainer;

        if (window.innerHeight + window.scrollY >= wrapperHeight) {
            activeStatContainer = [].slice.call(statContainers).pop();
        } else {
            [].forEach.call(statContainers, function (statContainer) {
                rectYs.push(statContainer.getBoundingClientRect().y);
            });

            rectYs.forEach(function (rectY, index) {
                if (rectY < 250 && rectY > activeY) {
                    activeY = rectY;
                    activeIndex = index;
                }
            });

            activeStatContainer = statContainers[activeIndex];
        }

        let activeTab = document.querySelector(
            ".nav-item[data-target=" +
                activeStatContainer.getAttribute("data-stat") +
                "]"
        );

        if (!activeTab.classList.contains("active")) {
            [].forEach.call(
                document.querySelectorAll(".nav-item.active"),
                function (statContainer) {
                    statContainer.classList.remove("active");
                }
            );

            anime({
                targets: "#nav_items_container",
                scrollLeft:
                    activeTab.offsetLeft -
                    window.innerWidth / 2 +
                    activeTab.offsetWidth / 2,
                duration: 350,
                easing: "easeOutCubic",
            });

            activeTab.classList.add("active");
        }

        updateTab = false;
    }

    setInterval(updateActiveTab, 100);

    updateTab = true;

    [].forEach.call(document.querySelectorAll(".nav-item"), function (element) {
        element.addEventListener("click", function () {
            updateTabLock = true;
            updateTab = false;

            let newActiveTab = this;

            [].forEach.call(
                document.querySelectorAll(".nav-item.active"),
                function (statContainer) {
                    statContainer.classList.remove("active");
                }
            );

            anime({
                targets:
                    window.document.scrollingElement ||
                    window.document.body ||
                    window.document.documentElement,
                scrollTop:
                    positionY[newActiveTab.getAttribute("data-target")] - 60,
                duration: 350,
                easing: "easeOutCubic",
                complete: function () {
                    updateTabLock = false;
                    newActiveTab.classList.add("active");
                },
            });

            anime({
                targets: "#nav_items_container",
                scrollLeft:
                    newActiveTab.offsetLeft -
                    window.innerWidth / 2 +
                    newActiveTab.offsetWidth / 2,
                duration: 350,
                easing: "easeOutCubic",
            });
        });
    });
});
