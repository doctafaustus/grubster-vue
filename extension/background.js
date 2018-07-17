const devURL = 'http://localhost:8080';
const prodURL = 'https://grubster-app.herokuapp.com/';
const URL = prodURL;


// Installation callback
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: `${URL}?extension_callback=true` });
  }
});