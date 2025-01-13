# Deep Focus - Browser Extension

A powerful Chrome extension designed to enhance focus and learning by providing distraction-free browsing, note-taking, and content management features.

## Features

### 1. Reading Mode

- Blocks distracting websites while in learning mode
- Customizable list of blocked websites
- Seamless toggle between focus and normal browsing modes

### 2. Website Highlights & Notes

- Highlight and save important text from any webpage
- Context menu integration for quick note-taking
- Organize notes by website
- Export functionality for saved highlights and notes

### 3. YouTube Focus Mode

- Enhanced YouTube viewing experience with built-in note-taking
- Timestamp-based notes for video content
- Quick access to video sections through saved notes
- Distraction-free video viewing

### 4. Smart Search

- Search through saved highlights and notes
- Pop-up search interface
- Quick navigation to original content sources

## Technical Details

The extension is built using:

- Manifest V3 Chrome Extension API
- HTML/CSS/JavaScript
- Chrome Storage API for data persistence
- Chrome Declarative Net Request API for website blocking
- Context Menus API for quick actions

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click the extension icon to toggle Reading Mode
2. Use right-click menu to save highlights and notes
3. Access your saved content through the extension popup
4. Enable YouTube Focus Mode when watching educational content

## Permissions

- activeTab: For interacting with the current tab
- storage: For saving user preferences and notes
- tabs: For managing tab states
- declarativeNetRequest: For website blocking functionality
- contextMenus: For right-click menu integration
- scripting: For content script injection
- windows: For managing popup windows
- system.display: For optimal popup positioning

## Contributing

Feel free to submit issues and enhancement requests!
