document.addEventListener("DOMContentLoaded", () => {
  const tabWebsiteNotes = document.getElementById("tab-website-notes");
  const tabYoutube = document.getElementById("tab-youtube");
  const tabContentWebsiteNotes = document.getElementById(
    "tab-content-website-notes"
  );
  const tabContentYoutube = document.getElementById("tab-content-youtube");
  const toggle = document.getElementById("reading-mode-toggle");
  const youtubeFocusToggle = document.getElementById("youtube-focus-toggle");

  // Function to switch tabs
  function switchTab(tab, content) {
    document
      .querySelectorAll(".tab-header div")
      .forEach((tab) => tab.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));
    tab.classList.add("active");
    content.classList.add("active");

    if (tab === tabWebsiteNotes || tab === tabYoutube) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { message: "showSidebar" });
      });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { message: "hideSidebar" });
      });
    }
  }

  // Event listeners for tab switching
  tabWebsiteNotes.addEventListener("click", () =>
    switchTab(tabWebsiteNotes, tabContentWebsiteNotes)
  );
  tabYoutube.addEventListener("click", () =>
    switchTab(tabYoutube, tabContentYoutube)
  );

  // Event listeners for toggles
  toggle.addEventListener("change", () => {
    chrome.storage.sync.set({ readingMode: toggle.checked }, () => {
      chrome.runtime.sendMessage({
        message: "toggleReadingMode",
        value: toggle.checked,
      });
    });
  });

  youtubeFocusToggle.addEventListener("change", () => {
    chrome.storage.sync.set(
      { youtubeFocusMode: youtubeFocusToggle.checked },
      () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {
              message: "toggleYoutubeFocusMode",
              value: youtubeFocusToggle.checked,
            });
          }
        });
      }
    );
  });

  // Initialize state
  chrome.storage.sync.get(["readingMode", "youtubeFocusMode"], (data) => {
    toggle.checked = data.readingMode;
    youtubeFocusToggle.checked = data.youtubeFocusMode;
  });

  if (tabWebsiteNotes.classList.contains("active")) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { message: "showSidebar" });
    });
  }

  function loadYouTubeNotes() {
    const container = document.getElementById("youtube-notes-container");
    container.innerHTML = "";

    chrome.storage.load.get(null, (items) => {
      const videoIDs = Object.keys(items).filter((key) =>
        key.startsWith("youtube-")
      );

      videoIDs.forEach((videoID) => {
        const notes = items[videoID];
        const videoTitle = notes[0].videoTitle || "Unknown Video";
        const videoUrl = notes[0].videoUrl || "#";

        const videoDiv = document.createElement("div");
        videoDiv.className = "note-item";

        const videoLink = document.createElement("a");
        videoLink.href = videoUrl;
        videoLink.target = "_blank";
        videoLink.textContent = videoTitle;

        const notesList = document.createElement("ul");

        notes.forEach((note) => {
          const noteItem = document.createElement("li");
          const timestampLink = document.createElement("a");
          timestampLink.href = `${videoURL}&t=${Math.floor(note.time)}s`;
          timestampLink.target = "_blank";
          timestampLink.textContent = new Date(note.time * 1000)
            .toISOString()
            .substr(11, 8); // Format time to HH:mm:ss
          noteItem.appendChild(timestampLink);
          noteItem.appendChild(document.createTextNode(` - ${note.note}`));
          notesList.appendChild(noteItem);
        });

        videoDiv.appendChild(videoLink);
        videoDiv.appendChild(notesList);
        container.appendChild(videoDiv);
      });
    });
  }
});
