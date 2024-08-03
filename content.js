// content.js

// // Create and insert the sidebar
// function createSidebar() {
//   const sidebar = document.createElement("div");
//   sidebar.id = "highlight-sidebar";
//   sidebar.style.position = "fixed";
//   sidebar.style.right = "-300px"; // Initially hidden
//   sidebar.style.top = "0";
//   sidebar.style.width = "300px";
//   sidebar.style.height = "100%";
//   sidebar.style.backgroundColor = "#2c2c2c";
//   sidebar.style.borderLeft = "1px solid #ccc";
//   sidebar.style.padding = "10px";
//   sidebar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
//   sidebar.style.zIndex = "10000";
//   sidebar.style.overflowY = "scroll";
//   sidebar.style.transition = "right 0.3s ease-in-out";
//   sidebar.style.color = "#f5f5f5";

//   const closeButton = document.createElement("button");
//   closeButton.textContent = "Close";
//   closeButton.style.width = "100%";
//   closeButton.onclick = () => {
//     sidebar.style.right = "-300px";
//   };
//   sidebar.appendChild(closeButton);

//   const highlightsContainer = document.createElement("div");
//   highlightsContainer.id = "highlights-container";
//   sidebar.appendChild(highlightsContainer);

//   document.body.appendChild(sidebar);
// }

// // Function to show the sidebar
// function showSidebar() {
//   const sidebar = document.getElementById("highlight-sidebar");
//   sidebar.style.right = "0";
// }

// // Function to hide the sidebar
// function hideSidebar() {
//   const sidebar = document.getElementById("highlight-sidebar");
//   sidebar.style.right = "-300px";
// }

// Handle reading mode functionality
chrome.storage.sync.get("readingMode", (data) => {
  if (data.readingMode) {
    document.addEventListener("click", function (event) {
      let target = event.target;

      while (target && target.tagName !== "A") {
        target = target.parentElement;
      }

      if (
        target &&
        target.tagName === "A" &&
        target.href &&
        !target.href.startsWith(window.location.origin)
      ) {
        event.preventDefault();

        // Show the confirmation message
        const confirmBox = document.createElement("div");
        confirmBox.style.position = "fixed";
        confirmBox.style.top = "50%";
        confirmBox.style.left = "50%";
        confirmBox.style.transform = "translate(-50%, -50%)";
        confirmBox.style.backgroundColor = "#fff";
        confirmBox.style.border = "1px solid #ccc";
        confirmBox.style.padding = "20px";
        confirmBox.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        confirmBox.style.zIndex = "10000";
        confirmBox.innerHTML = `
          <p>You are being redirected to an external site. Do you want to go there?</p>
          <button id="confirmYes">Yes</button>
          <button id="confirmNo">No</button>
        `;

        document.body.appendChild(confirmBox);

        document.getElementById("confirmYes").addEventListener("click", () => {
          window.location.href = target.href;
        });

        document.getElementById("confirmNo").addEventListener("click", () => {
          document.body.removeChild(confirmBox);
        });
      }
    });
  }
});

// Handle YouTube focus mode functionality
chrome.storage.sync.get("youtubeFocusMode", (data) => {
  if (data.youtubeFocusMode && window.location.hostname === "www.youtube.com") {
    hideYoutubeRecommendations();
  }
});

function hideYoutubeRecommendations() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        hideElements();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  hideElements();
}

function hideElements() {
  const elementsToHide = [
    "#related", // Related videos sidebar
    "#comments", // Comments section
    "#secondary", // Sidebar
    "#primary #guide", // Sidebar guide
    "ytd-compact-video-renderer", // Video suggestions in homepage
    "#chips", // YouTube chips
    "#contents", // Homepage content
    "ytd-rich-grid-media", // YouTube media grid
  ];

  elementsToHide.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      element.style.display = "none";
    });
  });
}

// Create highlight toolbar and event listeners
document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection();
  const toolbar = document.getElementById("highlight-toolbar");
  if (selection.toString().trim()) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const toolbarX = rect.left + window.scrollX;
    const toolbarY = rect.top + window.scrollY; // Adjusting the Y position to be above the selection
    showHighlightToolbar(toolbarX, toolbarY);
  } else {
    const toolbar = document.getElementById("highlight-toolbar");
    toolbar.style.display = "none";
  }
});

// Restore highlights on page load
window.addEventListener("load", () => {
  createHighlightToolbar();
  restoreHighlights();
});

// Listen for messages to show/hide the sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "showSidebar") {
    showSidebar();
  } else if (request.message === "hideSidebar") {
    hideSidebar();
  }
});
