
chrome.tabs.onActivated.addListener(onTabActivated);
chrome.tabs.onMoved.addListener(onTabMoved);
chrome.tabs.onUpdated.addListener(onTabUpdated);

function onTabMoved(tabId, moveInfo) {
    console.log("tab moved", tabId, moveInfo);
}

function onTabUpdated(tabId, changeInfo, tab) {
    console.log("tab updated", tabId, changeInfo, tab);
}

async function onTabActivated(activeInfo) {
    console.log("tab activated", activeInfo);

    const tabInfo = await chrome.tabs.get(activeInfo.tabId);
    console.log("tabInfo", tabInfo);

    // Ignore pinned tabs
    if (tabInfo.pinned) {
        return;
    }

    // Moving the tab immediately often results in:
    // "Unchecked runtime.lastError: Tabs cannot be edited right now (user may be dragging a tab)."
    // There doesn't seem to be a good way to know when, exactly, the false "drag" ends,
    // so just keep trying until it works.
    let tries = 0;
    function moveTab() {
        tries++;
        chrome.tabs.move(
            activeInfo.tabId,
            {
                // MRU tabs stack left-to-right with the most recent tab on the far right
                index: -1
            },
            tabDetails => {
                if (chrome.runtime.lastError &&
                    chrome.runtime.lastError.message === "Tabs cannot be edited right now (user may be dragging a tab).") {
                    tries++;
                    if (tries < 20) {
                        setTimeout(moveTab, 10);
                    } else {
                        console.error(chrome.runtime.lastError);
                    }
                }
            }
        );
    }
    moveTab();
}
