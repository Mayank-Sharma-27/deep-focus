chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ readingMode: false, blockedWebsites: [] });
  updateBlockingRules();
  chrome.contextMenus.create({
    id: "saveNote",
    title: "Save Note to Reading Mode Extension",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveNote") {
    const selectedText = info.selectionText;
    const currentTabUrl = new URL(tab.url).origin;
    const timestamp = new Date().toLocaleString();
    const noteWithTime = {
      text: selectedText,
      time: timestamp,
    };

    chrome.storage.local.get([currentTabUrl], (result) => {
      const notes = result[currentTabUrl] || [];
      notes.push(noteWithTime);
      chrome.storage.local.set({ [currentTabUrl]: notes }, () => {
        console.log("Note saved:", selectedText);
      });
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.sync.get("readingMode", ({ readingMode }) => {
    chrome.storage.sync.set({ readingMode: !readingMode }, () => {
      chrome.action.setIcon({
        path: "icon.png",
      });
      chrome.tabs.reload(tab.id);
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "getReadingMode") {
    chrome.storage.sync.get("readingMode", (data) => {
      sendResponse(data.readingMode);
    });
    return true;
  }
  if (request.message === "getBlockedWebsites") {
    chrome.storage.sync.get("blockedWebsites", (data) => {
      sendResponse(data.blockedWebsites);
    });
    return true;
  }
  if (request.message === "updateBlockingRules") {
    updateBlockingRules();
  }
  if (request.message === "checkBlockedWebsites") {
    chrome.storage.sync.get("blockedWebsites", (data) => {
      sendResponse({ blockedWebsites: data.blockedWebsites });
    });
    return true;
  }
  if (request.message === "updateYoutubeFocusMode") {
    chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.reload(tab.id);
      });
    });
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.blockedWebsites) {
    updateBlockingRules();
  }
});

chrome.storage.sync.get(
  ["readingMode", "blockedWebsites"],
  ({ readingMode, blockedWebsites }) => {
    if (readingMode) {
      updateBlockingRules();
    }
  }
);

function updateBlockingRules() {
  chrome.storage.sync.get("blockedWebsites", (data) => {
    const blockedWebsites = data.blockedWebsites || [];
    const rules = blockedWebsites.map((site, index) => {
      let urlPattern = site.replace(/^https?:\/\//, "").replace(/\/$/, "");
      return {
        id: index + 1,
        priority: 1,
        action: {
          type: "redirect",
          redirect: { extensionPath: "/blocked.html" },
        },
        condition: {
          urlFilter: `*://${urlPattern}/*`,
          resourceTypes: ["main_frame"],
        },
      };
    });

    chrome.declarativeNetRequest.updateDynamicRules(
      { removeRuleIds: Array.from({ length: 1000 }, (_, i) => i + 1) },
      () => {
        chrome.declarativeNetRequest.updateDynamicRules(
          { addRules: rules },
          () => {
            console.log("Blocking rules updated");
          }
        );
      }
    );
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSearchHighlights") {
    console.log("Received message in background script:", message);
    const { url, width, height } = message;

    chrome.system.display.getInfo((displays) => {
      const primaryDisplay = displays.find((display) => display.isPrimary);
      const screenWidth = primaryDisplay.bounds.width;
      const screenHeight = primaryDisplay.bounds.height;

      const popupWidth = Math.floor(width);
      const popupHeight = Math.floor(height);
      const left = Math.floor((screenWidth - popupWidth) / 2);
      const top = Math.floor((screenHeight - popupHeight) / 2);

      console.log("Creating popup window with URL:", url);

      chrome.windows.create(
        {
          url: url,
          type: "popup",
          width: popupWidth,
          height: popupHeight,
          left: left,
          top: top,
          focused: true,
        },
        (newWindow) => {
          if (chrome.runtime.lastError) {
            console.error("Error creating window:", chrome.runtime.lastError);
          } else {
            console.log("Popup window created:", newWindow);
          }
        }
      );
    });
  }
});
