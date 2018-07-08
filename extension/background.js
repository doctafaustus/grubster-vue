const devURL = 'http://localhost:8080';
const prodURL = 'http://www.grubster.com';
const URL = devURL;


// Installation callback
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: `${URL}?extension_callback=true` });
  }
});