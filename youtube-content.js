function createNoteButton() {
  const button = document.createElement("button");
  button.id = "take-note-button";
  button.textContent = "Take Note";
  button.style.position = "fixed";
  button.style.top = "10px";
  button.style.right = "10px";
  button.style.zIndex = "1000";
  button.style.backgroundColor = "#FF0000";
  button.style.color = "#FFFFFF";
  button.style.border = "none";
  button.style.padding = "10px";
  button.style.cursor = "pointer";
  button.addEventListener("click", () => {
    const video = document.querySelector("video");
    if (video) {
      const currentTime = video.currentTime;
      const note = prompt("Enter your note:");
      if (note) {
        const videoTitle = document
          .querySelector("h1.title")
          ?.textContent.trim();
        const videoUrl = window.location.href;
        saveNote({
          videoTitle,
          videoUrl,
          currentTime,
          note,
          timestamp: new Date().toLocaleString(),
        });
      }
    }
  });
  //document.body.appendChild(button);
}



function saveNote(note) {
  const key = `youtube_notes_${note.videoUrl}`;
  chrome.storage.local.get([key], (result) => {
    const notes = result[key] || [];
    notes.push(note);
    chrome.storage.local.set({ [key]: notes }, () => {
      console.log("Note saved:", note);
    });
  });
}

window.addEventListener("load", () => {
  createNoteButton();
});
