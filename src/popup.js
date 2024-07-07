document.addEventListener("DOMContentLoaded", function () {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      toggleTextbox(this, this.dataset.textboxId);
    });
  });
  loadSettings();
  document.getElementById("sendButton").addEventListener("click", sendSettings);
});

const toggleTextbox = (checkbox, textboxId) => {
  const textbox = document.getElementById(textboxId);
  if (textbox) {
    textbox.disabled = checkbox.checked;
  }
};

const loadSettings = () => {
  const settings = [
    "enableAllChannels",
    "channelIds",
    "enableAllMentions",
    "mentionIds",
    "enableAllDMs",
    "dmIds",
    "enableAutoMessage",
  ];
  settings.forEach((setting) => {
    const value = localStorage.getItem(setting);
    if (value !== null) {
      const element = document.getElementById(setting);
      if (element) {
        if (element.type === "checkbox") {
          element.checked = value === "true";
          toggleTextbox(element, element.dataset.textboxId);
        } else {
          element.value = value;
        }
      }
    }
  });
};

const saveSettings = () => {
  const settings = [
    "enableAllChannels",
    "channelIds",
    "enableAllMentions",
    "mentionIds",
    "enableAllDMs",
    "dmIds",
    "enableAutoMessage",
  ];
  settings.forEach((setting) => {
    const element = document.getElementById(setting);
    if (element) {
      if (element.type === "checkbox") {
        localStorage.setItem(setting, element.checked);
      } else {
        localStorage.setItem(setting, element.value);
      }
    }
  });
};

const sendSettings = () => {
  saveSettings();

  const settings = {
    enableAllChannels: document.getElementById("enableAllChannels").checked,
    channelIds: document.getElementById("channelIds").value,
    enableAllMentions: document.getElementById("enableAllMentions").checked,
    mentionIds: document.getElementById("mentionIds").value,
    enableAllDMs: document.getElementById("enableAllDMs").checked,
    dmIds: document.getElementById("dmIds").value,
    enableAutoMessage: document.getElementById("enableAutoMessage").checked,
  };

  // 設定をブラウザの他のタブに送信する
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { settings, type: "setting" },
      (response) => {
        if (response && response.status === "success") {
          showNotification("設定が更新されました。", "success");
        } else {
          showNotification("設定の更新に失敗しました。", "error");
        }
      }
    );
  });
};

const showNotification = (message, type) => {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
};
