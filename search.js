document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const highlightsList = document.getElementById("highlights-list");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    searchHighlights(query);
  });

  function searchHighlights(query) {
    chrome.storage.local.get(null, (items) => {
      highlightsList.innerHTML = "";
      for (const hostname in items) {
        if (items.hasOwnProperty(hostname)) {
          const highlights = items[hostname];
          highlights.forEach((highlight) => {
            if (highlight.text.toLowerCase().includes(query)) {
              addHighlightToList(highlight);
            }
          });
        }
      }
    });
  }

  function addHighlightToList(highlight) {
    const li = document.createElement("li");
    li.className = "highlight-item";

    const titleDiv = document.createElement("div");
    titleDiv.style.fontWeight = "bold";
    titleDiv.style.marginBottom = "5px";
    titleDiv.textContent = highlight.title;
    li.appendChild(titleDiv);

    const highlightText = document.createElement("div");
    highlightText.textContent = highlight.text;
    highlightText.style.marginBottom = "5px";
    li.appendChild(highlightText);

    const highlightDate = document.createElement("div");
    highlightDate.textContent = highlight.time;
    highlightDate.style.fontSize = "small";
    highlightDate.style.color = "gray";
    li.appendChild(highlightDate);

    const goToButton = document.createElement("button");
    goToButton.textContent = "Go to Highlight";
    goToButton.onclick = () => {
      chrome.tabs.create({ url: highlight.url });
    };
    li.appendChild(goToButton);

    highlightsList.appendChild(li);
  }

  // Load all highlights initially
  searchHighlights("");
});
