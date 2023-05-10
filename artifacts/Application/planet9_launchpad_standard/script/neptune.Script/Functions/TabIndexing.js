function setTabIndexOnElm(elm, index) {
    elm && elm.setAttribute("tabindex", index);
}

function setTabIndex(obj, index) {
    if (!obj.getVisible()) return;
    setTabIndexOnElm(obj.getDomRef(), index);
}

function setTabIndexOnItemsRecursively(obj) {
    obj.getItems &&
        obj
            .getItems()
            .filter((item) => item.getVisible())
            .forEach((item) => {
                globalTabIndex += 1;
                setTabIndex(item, globalTabIndex);
                if (item.getItems && item.getItems().length > 0) {
                    setTabIndexOnItemsRecursively(item);
                }
            });
}

function unsetTabIndexOnItemsRecursively(obj) {
    obj.getItems &&
        obj.getItems().forEach((item) => {
            setTabIndex(item, -1);
            if (item.getItems && item.getItems().length > 0) {
                unsetTabIndexOnItemsRecursively(item);
            }
        });
}

function onKeyPressFocusOnInput(obj) {
    obj.addEventDelegate({
        onkeydown: function (evt) {
            if (evt.key === "Enter") {
                obj.focus();
            }
        },
    });
}

function setTabIndicesForContentMenu() {
    if (!launchpadContentMenu.getVisible()) return;

    if (!AppCache.config.verticalMenu) {
        launchpadOverflowClickArea.setVisible(true);
    }
    
    disableTabIndicesLessThan0();

    setTabIndex(launchpadOverflowBtn, 4);
    setTabIndex(toolVerticalMenuFilter, 5);
    setTabIndexOnElm(toolVerticalMenuFilter.getDomRef().querySelector('[type="search"]'), 6);

    setTabIndex(toolVerticalMenuExpand, 7);
    setTabIndex(toolVerticalMenuCollapse, 8);

    globalTabIndex = 15;
    setTabIndicesForOpenApps();

    globalTabIndex = 40;
    setTabIndexOnItemsRecursively(ContentMenu);

    const refCollapse = toolVerticalMenuCollapse.getDomRef();
    function onFocusReset() {
        refCollapse.removeEventListener("focus", onFocusReset);
        setTabIndicesForContentMenu();
    }
    refCollapse.removeEventListener("focus", onFocusReset);
    refCollapse.addEventListener("focus", onFocusReset);

    const refList = ContentMenu.getDomRef();
    function onTabReset(evt) {
        if (evt.key === "Tab") {
            refList.removeEventListener("keyup", onTabReset);
            setTabIndicesForContentMenu();
        }
    }
    refList.removeEventListener("keyup", onTabReset);
    refList.addEventListener("keyup", onTabReset);
}

function unsetTabIndicesForOpenApps() {
    openApps.getItems().forEach((app) => {
        app.getItems().forEach((item) => {
            setTabIndex(item, -1);
        });
    });
}

function setTabIndicesForOpenApps() {
    openApps.getItems().forEach((app) => {
        // outer opened app
        app.getItems().forEach((item) => {
            // [app icon, close app button]
            setTabIndex(item, globalTabIndex);
            globalTabIndex += 1;
        });
    });
}

function unsetTabIndicesForContentMenu() {
    launchpadOverflowClickArea.setVisible(false);
    launchpadOverflowContainer.setVisible(false);

    [
        launchpadOverflowBtn,
        toolVerticalMenuFilter,
        toolVerticalMenuExpand,
        toolVerticalMenuCollapse,
    ].forEach((obj) => setTabIndex(obj, -1));

    unsetTabIndicesForOpenApps();
    unsetTabIndexOnItemsRecursively(ContentMenu);

    AppCacheShellMenu.focus();
}

function setTabIndicesForAppCacheListMenu() {
    setTabIndex(AppCacheShellUser, -1);

    launchpadSettings.addStyleClass("nepLaunchpadMenuSettingsOpen");
    launchpadSettingsContainer.setVisible(true);
    launchpadSettingsClickArea.setVisible(true);

    setTimeout(() => {
        disableTabIndicesLessThan0();
        setTabIndex(launchpadSettingsBtn, 10000);
        launchpadSettingsBtn.focus();

        globalTabIndex = 10010;
        setTabIndexOnItemsRecursively(AppCacheListMenu);
    }, 100);
}

function unsetTabIndicesForAppCacheListMenu() {
    setTabIndex(AppCacheShellUser, 4000);

    launchpadSettingsContainer.setVisible(false);
    launchpadSettingsClickArea.setVisible(false);
    launchpadSettings.removeStyleClass("nepLaunchpadMenuSettingsOpen");

    unsetTabIndexOnItemsRecursively(AppCacheListMenu);
}

function setTabIndexesOnApps() {
    const content = AppCacheNav.getCurrentPage().getContent();
    if (content.length > 0) {
        globalTabIndex = 5000;
        for (const section of content) {
            if (!section.getItems) continue;

            for (const grid of section.getItems()) {
                if (!grid.getItems) continue;

                for (const card of grid.getItems()) {
                    if (card.hasStyleClass("nepFCardContainer")) {
                        globalTabIndex += 1;
                        setTabIndex(card, globalTabIndex);

                        if (!card.getItems()) continue;

                        for (const cardItem of card.getItems()) {
                            // customizations related buttons
                            if (!sap.n.Customization.isActive) {
                                if (cardItem.hasStyleClass("nepDeleteCard")) continue;
                                if (cardItem.hasStyleClass("nepAddCard")) continue;
                            }

                            if (cardItem.getContent) {
                                const content = cardItem.getContent();
                                if (!content.getItems) continue;

                                for (const contentItem of content.getItems()) {
                                    if (!contentItem.getItems) continue;

                                    const items = contentItem.getItems();
                                    for (const actionContainer of items) {
                                        if (!actionContainer.hasStyleClass("nepActionContainer"))
                                            continue;
                                        if (!actionContainer.getItems) continue;

                                        for (const actionItem of actionContainer.getItems()) {
                                            if (
                                                !actionItem.getVisible() ||
                                                !actionItem.hasStyleClass("nepTileAction")
                                            )
                                                continue;
                                            setTabIndex(actionItem, globalTabIndex);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function disableTabIndicesLessThan0() {
    Array.from(document.querySelectorAll("[tabindex]"))
        .map((e) => [e, parseInt(e.getAttribute("tabindex"))])
        .filter(([_, tabindex]) => tabindex === 0)
        .forEach(([e]) => e.setAttribute("tabindex", -1));
}

function setTabIndices() {
    // App Navigation
    setTabIndex(AppCacheShellMenu, 1);
    unsetTabIndicesForContentMenu();

    if (AppCache.config.verticalMenu) {
        setTabIndicesForContentMenu();
    }

    // Logo
    setTabIndex(AppCacheShellLogoDesktop, 2000);
    setTabIndex(AppCacheShellLogoMobile, 2000);

    // App Back Button
    setTabIndex(AppCacheShellBack, 2001);

    // Top Menu
    globalTabIndex = 2005;
    setTabIndexOnItemsRecursively(AppCacheAppButton);

    // User Menu
    setTabIndex(AppCacheShellUser, 4000);
    // TODO, disable tabbing into right sidebar menu, unless you open the right sidebar menu
    unsetTabIndicesForAppCacheListMenu();

    // Apps
    setTabIndexesOnApps();
    setTabIndex(AppCachePageSideTab, -1);

    disableTabIndicesLessThan0();
}

AppCacheNav.onAfterRendering = () => {
    setTabIndices();
};

AppCacheNav.attachAfterNavigate(() => {
    setTabIndices();
});

window.addEventListener("keyup", (evt) => {
    if (evt.key === "Escape") {
        // left-side bar menu"
        if (launchpadOverflowContainer.getVisible()) {
            launchpadOverflowBtn.firePress();
        }

        // right-side settings menu
        if (launchpadSettingsContainer.getVisible()) {
            launchpadSettingsBtn.firePress();
        }
    }
});
