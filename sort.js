console.log("sort.js has been linked");
// Function to group and sort tabs
function sortTabsFunction() {
    return async function () {
        let tabs;
        try {
            tabs = await chrome.tabs.query({});
        } catch (error) {
            console.warn("Failed to query tabs:", error);
            return;
        }
        
        // Group tabs by domain and sort by last accessed time
        let groupedTabs = {};
        tabs.forEach(tab => {
            try {
                let url = new URL(tab.url);
                let domain = url.hostname;
                if (!groupedTabs[domain]) {
                    groupedTabs[domain] = [];
                }
                groupedTabs[domain].push(tab);
            } catch (error) {
                console.warn("Invalid tab URL:", tab.url, error);
            }
        });
        
        // Store original favicons and change them to tinted versions
        let originalFavicons = {};
        for (let domain in groupedTabs) {
            let tintedFavicon = `icons/tinted_${domain}.png`;
            groupedTabs[domain].forEach(tab => {
                if (!tab.favIconUrl) {
                    console.warn("Tab has no favicon:", tab);
                    return;
                }
                originalFavicons[tab.id] = tab.favIconUrl;
                try {
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
                } catch (error) {
                    console.warn("Failed to change favicon for tab:", tab.id, error);
                }
            });
        }
        
        // Flatten the groups and sort each group by last access time (if available)
        let sortedTabs = Object.values(groupedTabs).flatMap(group => 
            group.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))
        );
        
        // Reorder tabs
        sortedTabs.forEach((tab, index) => {
            try {
                chrome.tabs.move(tab.id, { index });
            } catch (error) {
                console.warn("Failed to move tab:", tab.id, error);
            }
        });
        
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
                    });
                } catch (error) {
                    console.warn("Failed to restore favicon for tab:", tabId, error);
                }
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
