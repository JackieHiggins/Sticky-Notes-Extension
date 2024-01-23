document.addEventListener('DOMContentLoaded', function () {
  const settingsButton = document.getElementById('settingsButton');
  const notesContainer = document.getElementById('notesContainer');
  const addNoteButton = document.getElementById('addNoteButton');
  
  // Open the settings window when the button is clicked
  settingsButton.addEventListener('click', function () {
    openSettingsWindow();
  });

  // Send a message to background.js to retrieve the notes for the current URL
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    chrome.runtime.sendMessage({ action: 'getNotes', url }, function (notes) {
      displayNotes(notes);
    });
  });

  // Add a new note when the button is clicked
  addNoteButton.addEventListener('click', function () {
    const title = prompt('Enter note title:');
    const body = prompt('Enter note body:');
    const note = { title, body, color: generateRandomColor() };

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const url = tabs[0].url;
      chrome.runtime.sendMessage({ action: 'addNote', url, note }, function (notes) {
        displayNotes(notes);
      });
    });
  });

  // Delete a note when the delete button is clicked
  notesContainer.addEventListener('click', function (event) {
    if (event.target.classList.contains('delete-button')) {
      const noteElement = event.target.parentElement;
      const noteIndex = Array.from(notesContainer.children).indexOf(noteElement);

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const url = tabs[0].url;
        chrome.runtime.sendMessage({ action: 'deleteNote', url, noteIndex }, function (notes) {
          displayNotes(notes);
        });
      });
    } else if (event.target.classList.contains('note-title')) {
      const noteElement = event.target.parentElement;
      noteElement.classList.toggle('expanded');
    }
  });

  // Display the notes in the popup
  function displayNotes(notes) {
    notesContainer.innerHTML = '';

    for (const note of notes) {
      const noteElement = document.createElement('div');
      noteElement.classList.add('note');
      noteElement.style.backgroundColor = note.color;

      const titleElement = document.createElement('div');
      titleElement.classList.add('note-title');
      titleElement.textContent = note.title;
      noteElement.appendChild(titleElement);

      const bodyElement = document.createElement('div');
      bodyElement.classList.add('note-body');
      bodyElement.textContent = note.body;
      noteElement.appendChild(bodyElement);

      const deleteButton = document.createElement('div');
      deleteButton.classList.add('delete-button');
      deleteButton.textContent = 'X';
      noteElement.appendChild(deleteButton);

      notesContainer.appendChild(noteElement);
    }
  }

  // Open a new window to display the settings
  function openSettingsWindow() {
    const windowUrl = chrome.runtime.getURL('settings.html');
    const windowOptions = {
      url: windowUrl,
      type: 'popup',
      width: 800,
      height: 600,
    };
    chrome.windows.create(windowOptions);
  }
  
  // Generate a random color
  function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
});



