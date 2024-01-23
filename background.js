// Initialize notes object in storage if it doesn't exist
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('notes', (data) => {
    if (!data.notes) {
      chrome.storage.local.set({ notes: {} });
    }
  });
});

// Maintain a count of notes for each tab
const tabNotesCount = {};

// Handle messages from the popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getNotes') {
    const url = message.url;
    chrome.storage.local.get('notes', (data) => {
      const notes = data.notes || {};
      const notesForUrl = notes[url] || [];
      sendResponse(notesForUrl);
    });
  } else if (message.action === 'addNote') {
    const url = message.url;
    const note = message.note;
    chrome.storage.local.get('notes', (data) => {
      const notes = data.notes || {};
      notes[url] = notes[url] || [];
      notes[url].push(note);
      chrome.storage.local.set({ notes }, () => {
        sendResponse(notes[url]);
        updateTabNotesCount(url);
      });
    });
  } else if (message.action === 'deleteNote') {
    const url = message.url;
    const noteIndex = message.noteIndex;
    chrome.storage.local.get('notes', (data) => {
      const notes = data.notes || {};
      if (notes[url]) {
        notes[url].splice(noteIndex, 1);
        chrome.storage.local.set({ notes }, () => {
          sendResponse(notes[url]);
          updateTabNotesCount(url);
        });
      }
    });
  }
  // Required to asynchronously send a response
  return true;
});

// Update the count of notes for a specific tab
function updateTabNotesCount(url) {
  chrome.tabs.query({ url }, (tabs) => {
    if (tabs.length > 0) {
      const tabId = tabs[0].id;
      chrome.storage.local.get('notes', (data) => {
        const notes = data.notes || {};
        const count = notes[url] ? notes[url].length : 0;
        tabNotesCount[tabId] = count;
        updateExtensionStatus();
      });
    }
  });
}

// Update the extension status with the total count of notes
function updateExtensionStatus() {
  let totalNotesCount = 0;
  for (const tabId in tabNotesCount) {
    totalNotesCount += tabNotesCount[tabId];
  }
  const statusText = `${totalNotesCount}`;
  chrome.action.setBadgeText({ text: statusText });
}

// Listen for tab removal to remove the tab count from the tracking
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabNotesCount[tabId];
  updateExtensionStatus();
});

// Listen for tab activation to update the count for the new tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;
  chrome.tabs.get(tabId, (tab) => {
    if (tab.url) {
      const url = new URL(tab.url).href;
      updateTabNotesCount(url);
    }
  });
});

// Set the initial count and badge background color
chrome.action.setBadgeText({ text: '0' }); // Replace '2' with your desired initial count
chrome.action.setBadgeBackgroundColor({ color: [0, 200, 0, 255] }); // Replace with your desired background color




chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getUrlsWithNotes') {
    chrome.storage.local.get('notes', (data) => {
      const notes = data.notes || {};
      const urls = Object.keys(notes).filter((url) => notes[url].length > 0);
      sendResponse(urls);
    });
  }
});