export function loadYouTubeNotes() {
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
      videoLink.className = "title";

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

export function addYouTubeNoteSection() {
  const youtubeNotesContainer = document.getElementById(
    "youtube-notes-container"
  );
  youtubeNotesContainer.innerHTML = "";

  const title = document.createElement("h3");
  title.textContent = "YouTube Notes";
  title.style.color = "white";
  youtubeNotesContainer.appendChild(title);

  const addNoteButton = document.createElement("button");
  addNoteButton.id = "youtube-add-note-button";
  addNoteButton.textContent = "Add Note";
  addNoteButton.onclick = () => {
    const video = document.querySelector("video");
    if (video) {
      const currentTime = video.currentTime;
      const note = prompt("Enter your note:");
      if (note) {
        const videoTitle = document
          .querySelector("h1.title")
          ?.textContent.trim();
        const videoUrl = window.location.href;
        const noteData = {
          videoTitle,
          videoUrl,
          currentTime,
          note,
          timestamp: new Date().toLocaleString(),
        };
        saveNoteToStorage(noteData);
        loadYouTubeNotes();
      }
    }
  };
  youtubeNotesContainer.appendChild(addNoteButton);

  loadYouTubeNotes();
}

export function saveNoteToStorage(note) {
  const key = `youtube_notes_${note.videoUrl}`;
  chrome.storage.local.get([key], (result) => {
    const notes = result[key] || [];
    notes.push(note);
    chrome.storage.local.set({ [key]: notes }, () => {
      console.log("Note saved:", note);
    });
  });
}
