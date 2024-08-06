// sidebar.js

// Function to create the sidebar
function createSidebar() {
  const sidebar = document.createElement("div");
  sidebar.id = "highlight-sidebar";

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.onclick = () => {
    toggleSidebar();
  };
  sidebar.appendChild(closeButton);

  const highlightsContainer = document.createElement("div");
  highlightsContainer.id = "highlights-container";
  sidebar.appendChild(highlightsContainer);

  const websitesContainer = document.createElement("div");
  websitesContainer.id = "websites-container";
  websitesContainer.style.marginTop = "20px";
  sidebar.appendChild(websitesContainer);

  const youtubeNotesContainer = document.createElement("div");
  youtubeNotesContainer.id = "youtube-notes-container";
  youtubeNotesContainer.style.marginTop = "20px";
  sidebar.appendChild(youtubeNotesContainer);

  document.body.appendChild(sidebar);
}

// Function to toggle the sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("highlight-sidebar");
  sidebar.classList.toggle("active");
}

// Function to show the sidebar
function showSidebar() {
  const sidebar = document.getElementById("highlight-sidebar");
  sidebar.classList.add("active");
}

// Function to hide the sidebar
function hideSidebar() {
  const sidebar = document.getElementById("highlight-sidebar");
  sidebar.classList.remove("active");
}

// Function to display highlights in the sidebar
function displayHighlights(highlights) {
  const container = document.getElementById("highlights-container");
  container.innerHTML = "";
  highlights.forEach((highlight) => {
    const highlightDiv = document.createElement("div");
    highlightDiv.className = "highlight-item";

    const titleDiv = document.createElement("div");
    titleDiv.style.fontWeight = "bold";
    titleDiv.style.marginBottom = "5px";
    titleDiv.textContent = `${highlight.title}`;
    highlightDiv.appendChild(titleDiv);

    const highlightText = document.createElement("div");
    highlightText.className = "text";
    highlightText.textContent = highlight.text;
    highlightText.style.marginBottom = "5px";
    highlightDiv.appendChild(highlightText);

    const highlightDate = document.createElement("div");
    highlightDate.textContent = highlight.time;
    highlightDate.className = "time";
    highlightDate.style.fontSize = "small";
    highlightDate.style.color = "gray";
    highlightDiv.appendChild(highlightDate);

    const highlightPage = document.createElement("a");
    highlightPage.textContent = "Go To Article";
    highlightPage.href = highlight.fullUrl;
    highlightPage.className = "page";
    highlightPage.style.fontSize = "small";
    highlightPage.style.color = "blue";
    highlightDiv.appendChild(highlightPage);

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "actions";

    if (highlight.note) {
      const noteDiv = document.createElement("div");
      noteDiv.className = "note";
      noteDiv.textContent = highlight.note;
      noteDiv.style.marginBottom = "5px";
      noteDiv.style.fontStyle = "italic";
      highlightDiv.appendChild(noteDiv);
    }

    const addNoteButton = document.createElement("button");
    addNoteButton.innerHTML = "&#128396;"; // Pencil emoji
    addNoteButton.title = "Add Note";
    addNoteButton.onclick = () => showNoteInput(highlight.id, highlightDiv);
    actionsDiv.appendChild(addNoteButton);

    const removeButton = document.createElement("button");
    removeButton.innerHTML = "&#128465;"; // Trash bin emoji
    removeButton.title = "Remove Highlight";
    removeButton.className = "remove-button";
    removeButton.onclick = () => removeHighlight(highlight.id);
    actionsDiv.appendChild(removeButton);

    highlightDiv.appendChild(actionsDiv);
    container.appendChild(highlightDiv);
  });
}

function showNoteInput(highlightId, highlightDiv) {
  const existingInput = highlightDiv.querySelector(".note-input-container");
  if (existingInput) {
    existingInput.remove();
    return;
  }

  const inputContainer = document.createElement("div");
  inputContainer.className = "note-input-container";

  const noteInput = document.createElement("textarea");
  noteInput.placeholder = "Take a note...";
  noteInput.className = "note-input";

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.className = "save-note-button";
  saveButton.onclick = () => saveNoteToHighlight(highlightId, noteInput.value);

  inputContainer.appendChild(noteInput);
  inputContainer.appendChild(saveButton);
  highlightDiv.appendChild(inputContainer);
}

function saveNoteToHighlight(highlightId, note) {
  if (note.trim() === "") return;
  chrome.storage.local.get([window.location.hostname], (result) => {
    const highlights = result[window.location.hostname] || [];
    const highlight = highlights.find((h) => h.id === highlightId);
    if (highlight) {
      highlight.note = note;
      chrome.storage.local.set(
        { [window.location.hostname]: highlights },
        () => {
          loadCurrentPageHighlights();
        }
      );
    }
  });
}

// Function to load highlights for the current page
function loadCurrentPageHighlights() {
  const hostname = window.location.hostname;
  if (hostname.includes("youtube.com")) {
    loadYouTubeNotes();
    addYouTubeNoteSection(); // Add this line to ensure the note section is added
  } else {
    chrome.storage.local.get([hostname], (items) => {
      const highlights = items[hostname] || [];
      displayHighlights(highlights);
    });
  }
}
// Function to remove a highlight
function removeHighlight(highlightId) {
  const hostname = window.location.hostname;
  chrome.storage.local.get([hostname], (result) => {
    let highlights = result[hostname] || [];
    highlights = highlights.filter((h) => h.id !== highlightId);
    chrome.storage.local.set({ [hostname]: highlights }, () => {
      loadCurrentPageHighlights();
    });
  });
}

function normalizeURL(url) {
  const urlObject = new URL(`https://${url}`);
  return urlObject.hostname.replace(/^www\./, "");
}

function initializeSidebar() {
  createSidebar();
  loadCurrentPageHighlights();
}

function displayWebsites() {
  const container = document.getElementById("websites-container");
  container.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = "Websites with Highlights";
  title.style.color = "white"; // Set the color to white for the title
  container.appendChild(title);

  chrome.storage.local.get(null, (items) => {
    // Collect all unique websites
    const websites = Object.keys(items)
      .map(normalizeURL)
      .filter((v, i, a) => a.indexOf(v) === i);

    websites.forEach((website) => {
      const websiteDiv = document.createElement("div");
      websiteDiv.className = "website-item";
      websiteDiv.style.color = "white"; // Ensure text is white
      websiteDiv.textContent = website;
      websiteDiv.addEventListener("click", () => {
        window.location.href = `https://${website}`;
      });
      container.appendChild(websiteDiv);
    });
  });
}

function loadYouTubeNotes() {
  const container = document.getElementById("youtube-notes-container");
  container.innerHTML = "";

  chrome.storage.local.get(null, (items) => {
    const videoKeys = Object.keys(items).filter((key) =>
      key.startsWith("youtube_notes_")
    );

    videoKeys.forEach((videoKey) => {
      const notes = items[videoKey];
      if (notes.length === 0) return;

      const videoTitle = notes[0]?.videoTitle || "Unknown Video";
      const videoUrl = notes[0]?.videoUrl || "#";

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
        timestampLink.href = `${videoUrl}&t=${Math.floor(note.currentTime)}s`;
        timestampLink.target = "_blank";
        timestampLink.textContent = new Date(note.currentTime * 1000)
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

function addYouTubeNoteSection() {
  const youtubeNotesContainer = document.getElementById(
    "youtube-notes-container"
  );
  youtubeNotesContainer.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = "YouTube Notes";
  title.style.color = "white"; // Set the color to white for the title
  youtubeNotesContainer.appendChild(title);

  const addNoteButton = document.createElement("button");
  addNoteButton.textContent = "Add Note";
  addNoteButton.onclick = () => {
    const video = document.querySelector("video");
    if (video) {
      const currentTime = video.currentTime;
      const note = prompt("Enter your note:");
      if (note) {
        const videoTitle = document.querySelector("title")?.textContent || "";
        const videoUrl = window.location.href;
        saveNote({
          videoTitle,
          videoUrl,
          currentTime,
          note,
          timestamp: new Date().toLocaleString(),
        });
        loadYouTubeNotes(); // Ensure notes are reloaded after adding a new one
      }
    }
  };
  youtubeNotesContainer.appendChild(addNoteButton);
}

window.initializeSidebar = initializeSidebar;
window.toggleSidebar = toggleSidebar;

// Ensure the sidebar is initialized on page load
window.addEventListener("load", () => {
  initializeSidebar();
});
