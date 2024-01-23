document.addEventListener('DOMContentLoaded', function () {
  

  const urlsTab = document.getElementById('urlsTab');
  const displayTab = document.getElementById('displayTab');
  const urlsList = document.getElementById('urlsList');
  const displaySettingsForm = document.getElementById('displaySettingsForm');

  document.body.style.visibility = 'visible';

  // Switch to the urlsTab when clicked
  urlsTab.addEventListener('click', function () {
    urlsTab.classList.add('active');
    displayTab.classList.remove('active');
    urlsList.style.display = 'block';
    displaySettingsForm.style.display = 'none';
  });
  urlsTab.click();

  // Send a message to background.js to retrieve URLs with active notes
  chrome.runtime.sendMessage({ action: 'getUrlsWithNotes' }, function (urls) {
    displayUrls(urls);
  });

  // Display the URLs with active notes in the urlsTab
  function displayUrls(urls) {
    urlsList.innerHTML = '';

    for (const url of urls) {
      const urlItem = document.createElement('li');
      urlItem.textContent = url;
      urlsList.appendChild(urlItem);
    }
  }

  // Submit the display settings form
  displaySettingsForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(displaySettingsForm);
    const backgroundColor = formData.get('backgroundColor');
    const fontColor = formData.get('fontColor');
    const fontSize = formData.get('fontSize');
    const displaySettings = { backgroundColor, fontColor, fontSize };
    chrome.runtime.sendMessage({ action: 'setDisplaySettings', displaySettings });
  });


  
  // Switch to the displayTab when clicked
  displayTab.addEventListener('click', function () {
    displayTab.classList.add('active');
    urlsTab.classList.remove('active');
    urlsList.style.display = 'none';
    displaySettingsForm.style.display = 'block';
  });
  
});





