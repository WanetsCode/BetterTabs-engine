// background.js

// Replace the sortTabsFunction wrapper with a direct async function
async function FindOldest() {
    console.log("FindOldest: Starting tab query");
    let tabs;
    try {
        tabs = await chrome.tabs.query({ currentWindow: true });
        console.log("FindOldest: Retrieved", tabs.length, "tabs");
    } catch (error) {
        console.warn("Failed to query tabs:", error);
        return;
    }
    
    const now = Date.now();
    // NEW: Group tabs:
    // "Recent" if accessed within 1 hour,
    // "Old" if lastAccessed exists & is older than 5 days; if undefined, treat as Standard.
    let groupedTabs = { "Recent": [], "Standard": [], "Old": [] };
    tabs.forEach(tab => {
        // Only process http(s) pages to avoid injection into chrome:// pages.
        if (!/^https?:\/\//.test(tab.url)) return;
        let lastAccessed = tab.lastAccessed || 0;
        if (lastAccessed && lastAccessed >= now - 3600000) { // within 1 hour
            groupedTabs["Recent"].push(tab);
        } else if (lastAccessed && lastAccessed < now - 432000000) { // older than 5 days
            groupedTabs["Old"].push(tab);
        } else {
            groupedTabs["Standard"].push(tab);
        }
    });
    console.log("Grouping done:", groupedTabs);
    
    // Preserve original favicons and update using tinted icons ONLY for "Old" tabs.
    let originalFavicons = {};
    for (let groupName in groupedTabs) {
        groupedTabs[groupName].forEach(tab => {
            if (!tab.favIconUrl) {
                console.warn("Tab has no favicon:", tab);
                return;
            }
            originalFavicons[tab.id] = tab.favIconUrl;
            // Only change favicon if the tab belongs to the "Old" group.
            if (groupName === "Old") {
                try {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (favicon) => {
                            let link = document.querySelector("link[rel~='icon']");
                            if (!link) {
                                link = document.createElement("link");
                                link.rel = "icon";
                                document.head.appendChild(link);
                            }
                            link.href = favicon;
                        },
                        args: ["icons/tinted_gray.png"]
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn(`executeScript error for tab ${tab.id}:`, chrome.runtime.lastError.message);
                        }
                    });
                } catch (error) {
                    console.warn("Failed to change favicon for tab:", tab.id, error);
                }
            }
        });
    }
    
    // NEW: Sort each group's tabs. For "Recent"/"Standard", sort descending; "Old" ascending.
    groupedTabs["Recent"].sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
    groupedTabs["Standard"].sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
    groupedTabs["Old"].sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0));
    
    // Concatenate groups in desired order
    const groupOrder = ["Old", "Standard", "Recent"];
    let sortedTabs = [];
    groupOrder.forEach(groupName => {
        sortedTabs = sortedTabs.concat(groupedTabs[groupName]);
    });
    console.log("Sorted tabs order:", sortedTabs.map(t => t.id));
    
    // NEW: Create and name tab groups using async/await
    async function groupAndNameTabs() {
        for (let groupName of groupOrder) {
            if (groupedTabs[groupName].length > 0) {
                let tabIds = groupedTabs[groupName].map(tab => tab.id);
                await new Promise(resolve => {
                    chrome.tabs.group({ tabIds }, groupId => {
                        if (chrome.runtime.lastError) {
                            console.warn(`Failed to create group for ${groupName}:`, chrome.runtime.lastError.message);
                            resolve();
                        } else {
                            chrome.tabGroups.update(groupId, { title: groupName }, () => {
                                console.log(`Group ${groupName} updated with id ${groupId}`);
                                resolve();
                            });
                        }
                    });
                });
            }
        }
    }
    await groupAndNameTabs();
    
    // Reorder tabs based on sorted order
    sortedTabs.forEach((tab, index) => {
        try {
            chrome.tabs.move(tab.id, { index }, () => {
                if (chrome.runtime.lastError) {
                    console.warn("Failed to move tab:", tab.id, chrome.runtime.lastError.message);
                }
            });
        } catch (error) {
            console.warn("Failed to move tab:", tab.id, error);
        }
    });
    
    // NEW: Change the button text to "Sorted!" for one second if operation succeeds.
    const sortButton = document.querySelector('button[onClick="sortTabsFunction()"]');
    if (sortButton) {
        sortButton.innerText = "Sorted!";
        setTimeout(() => { sortButton.innerText = "Sort Tabs"; }, 1000);
    }
    
    // Restore original favicons after sorting
    setTimeout(() => {
        for (let tabId in originalFavicons) {
            try {
                chrome.scripting.executeScript({
                    target: { tabId: parseInt(tabId) },
                    func: (favicon) => {
                        let link = document.querySelector("link[rel~='icon']");
                        if (link) {
                            link.href = favicon;
                        }
                    },
                    args: [originalFavicons[tabId]]
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn(`Restore favicon error for tab ${tabId}:`, chrome.runtime.lastError.message);
                    }
                });
            } catch (error) {
                console.warn("Failed to restore favicon for tab:", tabId, error);
            }
        }
    }, 3000);
}

// Remove the previous sortTabs assignment; now directly expose sortTabs
// Expose functions globally for index.html onClick calls
window.FindOldest = FindOldest;
window.autoSortFunction = function() {
    console.log("AutoSort function not implemented yet");
    // ...future implementation...
};
window.transferFunction = function() {
    console.log("Transfer function not implemented yet");
    // ...future implementation...
};
window.importFunction = function() {
    console.log("Import function not implemented yet");
    // ...future implementation...
};
window.apiFunction = function() {
    console.log("API function not implemented yet");
    // ...future implementation...
};

// Listen for messages from the popup or other scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sortTabs") {
        sortTabs();
        sendResponse({ status: "Tabs sorted" });
    }
});
