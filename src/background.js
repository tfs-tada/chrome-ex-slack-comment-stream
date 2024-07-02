chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.initiator === "https://app.slack.com") {
      if (details.url.includes("wss://") && details.url.includes("token=")) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { data: details.url });
        });
      }
    }
  },
  { urls: ["<all_urls>"] },
  []
);
