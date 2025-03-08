// background.js

// Function to group and sort tabs
function sortTabsFunction() {
    return async function () {
        let tabs = await chrome.tabs.query({});
        
        // Group tabs by domain and sort by last accessed time
        let groupedTabs = {};
        tabs.forEach(tab => {
            let url = new URL(tab.url);
            let domain = url.hostname;
            if (!groupedTabs[domain]) {
                groupedTabs[domain] = [];
            }
            groupedTabs[domain].push(tab);
        });
        
        // Store original favicons and change them to tinted versions
        let originalFavicons = {};
        for (let domain in groupedTabs) {
            let tintedFavicon = `icons/tinted_${domain}.png`;
            groupedTabs[domain].forEach(tab => {
                originalFavicons[tab.id] = tab.favIconUrl;
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: (favicon) => {
                        let link = document.querySelector("link[rel~='icon']");
                        if (link) {
                            link.href = favicon;
                        }
                    },
                    args: [tintedFavicon]
                });
            });
        }
        
        // Flatten the groups and sort each group by last access time (if available)
        let sortedTabs = Object.values(groupedTabs).flatMap(group => 
            group.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))
        );
        
        // Reorder tabs
        sortedTabs.forEach((tab, index) => {
            chrome.tabs.move(tab.id, { index });
        });
        
        // Restore original favicons after sorting
        setTimeout(() => {
            for (let tabId in originalFavicons) {
                chrome.scripting.executeScript({
                    target: { tabId: parseInt(tabId) },
                    func: (favicon) => {
                        let link = document.querySelector("link[rel~='icon']");
                        if (link) {
                            link.href = favicon;
                        }
                    },
                    args: [originalFavicons[tabId]]
                });
            }
        }, 3000);
    };
}

const sortTabs = sortTabsFunction();

// Listen for messages from the popup or other scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sortTabs") {
        sortTabs();
        sendResponse({ status: "Tabs sorted" });
    }
});
