// highlight.js

// Create the toolbar for highlighting
function createHighlightToolbar() {
  const toolbar = document.createElement("div");
  toolbar.id = "highlight-toolbar";
  toolbar.style.position = "absolute";
  toolbar.style.display = "none";
  toolbar.style.border = "1px solid #ccc";
  toolbar.style.backgroundColor = "#fff";
  toolbar.style.padding = "5px";
  toolbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  toolbar.style.zIndex = "10000";

  const colors = ["yellow", "green", "blue", "pink", "orange"];
  colors.forEach((color) => {
    const colorButton = document.createElement("button");
    colorButton.style.backgroundColor = color;
    colorButton.style.border = "none";
    colorButton.style.width = "20px";
    colorButton.style.height = "20px";
    colorButton.style.margin = "2px";
    colorButton.onclick = () => applyHighlight(color);
    toolbar.appendChild(colorButton);
  });

  document.body.appendChild(toolbar);
}

// Show the toolbar at the specified coordinates
function showHighlightToolbar(x, y) {
  const toolbar = document.getElementById("highlight-toolbar");
  toolbar.style.left = `${x}px`;
  toolbar.style.top = `${y}px`;
  toolbar.style.display = "flex";
}

function getTitle() {
  const title = window.location.hostname;
  const heading = document.querySelector("title")?.textContent || "";
  return heading ? `${heading} | ${title}` : title;
}

// Apply the highlight to the selected text with the given color
function applyHighlight(color) {
  const selection = window.getSelection();
  if (selection.toString().trim()) {
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style.backgroundColor = color;
    span.className = "highlight";
    range.surroundContents(span);

    const highlightData = {
      id: createHighlightId(),
      text: selection.toString(),
      url: window.location.hostname,
      color: color,
      rangeDetails: getRangeDetails(range),
      time: new Date().toLocaleString(),
      topic: null,
      title: getTitle(),
      fullUrl: window.location.href,
    };

    saveHighlight(highlightData);
    console.log("Highlight saved:", highlightData);
    initializeHighlightEventListeners(span);
  }
  const toolbar = document.getElementById("highlight-toolbar");
  toolbar.style.display = "none";
}

// Function to initialize event listeners for the highlight
function initializeHighlightEventListeners(element) {
  element.addEventListener("mouseenter", () => {
    element.style.cursor = "pointer";
  });

  element.addEventListener("mouseleave", () => {
    element.style.cursor = "default";
  });
}

// Function to create a unique ID for each highlight
function createHighlightId() {
  return "highlight-" + Math.random().toString(36).substr(2, 9);
}

// Function to save the highlight
function saveHighlight(highlightData) {
  const hostname = window.location.hostname;
  chrome.storage.local.get([hostname], (result) => {
    const highlights = result[hostname] || [];
    highlights.push(highlightData);
    chrome.storage.local.set({ [hostname]: highlights });
  });
}

// Function to get the range details of the selection
function getRangeDetails(range) {
  const startXPath = getEnhancedXPath(range.startContainer);
  const endXPath = getEnhancedXPath(range.endContainer);

  console.log(
    "Range details - startXPath:",
    startXPath,
    "startOffset:",
    range.startOffset
  );
  console.log(
    "Range details - endXPath:",
    endXPath,
    "endOffset:",
    range.endOffset
  );

  return {
    startContainerXPath: startXPath,
    startOffset: range.startOffset,
    endContainerXPath: endXPath,
    endOffset: range.endOffset,
  };
}

function getXPath(node) {
  let path = "";
  while (node && node.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = node.previousSibling;
    while (sibling) {
      if (
        sibling.nodeType === Node.ELEMENT_NODE &&
        sibling.nodeName === node.nodeName
      ) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    path = `/${node.nodeName.toLowerCase()}[${index + 1}]` + path;
    node = node.parentNode;
  }
  return path;
}

// Enhanced function to get the XPath of a node, considering text nodes
function getEnhancedXPath(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return getXPath(node.parentNode) + "/text()";
  }
  return getXPath(node);
}

// Function to restore range from range details
function restoreRange(details) {
  const startContainer = getElementByXPath(details.startContainerXPath);
  const endContainer = getElementByXPath(details.endContainerXPath);

  // Check if the start and end containers exist
  if (!startContainer || !endContainer) {
    console.error("Error: startContainer or endContainer not found.");
    return null;
  }

  // Ensure startContainer and endContainer are text nodes
  let startNode = startContainer;
  if (startContainer.nodeType !== Node.TEXT_NODE) {
    startNode = startContainer.firstChild;
  }
  let endNode = endContainer;
  if (endContainer.nodeType !== Node.TEXT_NODE) {
    endNode = endContainer.firstChild;
  }

  // Handle edge case where startNode or endNode is null
  if (!startNode || !endNode) {
    console.error("Error: startNode or endNode is null.");
    return null;
  }

  console.log("Start container:", startNode);
  console.log("End container:", endNode);
  console.log("Start offset:", details.startOffset);
  console.log("End offset:", details.endOffset);

  // Check if the offsets are within valid range
  if (details.startOffset > startNode.textContent.length) {
    console.error("Error: startOffset is out of range.");
    return null;
  }
  if (details.endOffset > endNode.textContent.length) {
    console.error("Error: endOffset is out of range.");
    return null;
  }

  const range = document.createRange();

  try {
    range.setStart(startNode, details.startOffset);
    range.setEnd(endNode, details.endOffset);
  } catch (e) {
    console.error("Error setting range:", e);
    return null;
  }

  return range;
}

// Function to get an element by its XPath
function getElementByXPath(xpath) {
  if (!xpath) {
    console.error("Invalid XPath:", xpath);
    return null;
  }
  const evaluator = new XPathEvaluator();
  const result = evaluator.evaluate(
    xpath,
    document.documentElement,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  );
  console.log("Element retrieved by XPath:", xpath, result.singleNodeValue);
  return result.singleNodeValue;
}

// Function to apply highlight by text content
function applyHighlightByTextContent(container, text, color = "yellow") {
  const regex = new RegExp(`(${text})`, "gi");
  container.innerHTML = container.innerHTML.replace(
    regex,
    `<span style="background-color: ${color};">$1</span>`
  );
}

// Restore highlights on page load
function restoreHighlights() {
  chrome.storage.local.get([window.location.hostname], (result) => {
    const highlights = result[window.location.hostname] || [];
    console.log("Restoring highlights:", highlights); // Log highlights to restore
    highlights.forEach((highlight) => {
      const paragraph = getElementByXPath(
        highlight.rangeDetails.startContainerXPath
      );
      if (paragraph) {
        applyHighlightByTextContent(paragraph, highlight.text, highlight.color);
        console.log("Restored highlight:", highlight); // Log each restored highlight
      } else {
        console.error("Paragraph not found for highlight:", highlight);
      }
    });
  });
}

// Listen for highlightText message to restore highlight from link click
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "highlightText" && request.highlightId) {
    chrome.storage.local.get([window.location.origin], (result) => {
      const highlights = result[window.location.origin] || [];
      const highlight = highlights.find((h) => h.id === request.highlightId);
      if (highlight) {
        const paragraph = getElementByXPath(
          highlight.rangeDetails.startContainerXPath
        );
        if (paragraph) {
          applyHighlightByTextContent(
            paragraph,
            highlight.text,
            highlight.color
          );
          console.log("Highlighted text restored:", highlight);
        } else {
          console.error("Paragraph not found for highlight:", highlight);
        }
      }
    });
  }
});

// Export functions for use in content.js
window.createHighlightToolbar = createHighlightToolbar;
window.showHighlightToolbar = showHighlightToolbar;
window.applyHighlight = applyHighlight;
window.initializeHighlightEventListeners = initializeHighlightEventListeners;
window.restoreHighlights = restoreHighlights;
