let wsFlag = null;

// type SlackFilter = {
//   enableAllChannels: boolean;
//   channelIds: string;
//   enableAllMentions: boolean;
//   mentionIds: string;
//   enableAllDMs: boolean;
//   dmIds: string;
//   enableAutoMessage: boolean;
// };
const storageFilterData = localStorage.getItem("slackFilter");
let slackFilter = storageFilterData ? JSON.parse(storageFilterData) : null;
const checkRequestData = (data) => {
  if (!slackFilter) {
    return false;
  }
  if (!data) {
    return false;
  }
  // data.channel.sub が auto の場合、enableAutoMessage が false ならばらフィルタリングする
  if (data.channel.sub === "auto") {
    if (!slackFilter.enableAutoMessage) {
      return false;
    }
  }

  // slackFilter を使ってチャンネルのフィルタリングを行う
  // data.text: string からすべての <@{任意の文字列 文字数不問}> と <!subteam^{文字数不問}>を抽出し、mentionIds とする
  // mentionIds: string[]
  // const mentionIds = data.text.match(/<@[^>]+>|<!subteam\^[^>]+>/g) || [];   これだと subteam という文字列も入ってしまう。{文字数不問} のところのみを抜き出す
  
  // todo: mentionIds が mentionIds に含まれているかどうかを確認する
  // if (mentionIds.length > 0 && !slackFilter.enableAllMentions) {
  //   const res = mentionIds.map((mentionId) => {
  //     if (slackFilter.mentionIds.includes(mentionId)) {
  //       return true;
  //     }
  //   });
  //   if (res.includes(true)) {
  //     return true;
  //   }
  // }

  // data.channel が C0始まりならば チャンネルフィルタリング
  if (data.channel.startsWith("C0")) {
    if (slackFilter.enableAllChannels) {
      return true;
    }
    const channelIds = slackFilter.channelIds.split(",");
    if (channelIds.includes(data.channel)) {
      return true;
    }
  }

  // data.channel が D0始まりならば DM
  if (data.channel.startsWith("D0")) {
    if (slackFilter.enableAllDMs) {
      return true;
    }
    const dmIds = slackFilter.dmIds.split(",");
    if (dmIds.includes(data.channel)) {
      return true;
    }
  }

  return false;
};

// ws connection
chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
  if (request.type !== "ws") return;
  if (!!wsFlag) return;
  wsFlag = true;
  const socket = new WebSocket(request.data);
  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type !== "message") return;
    if (!checkRequestData(data)) return;
    fetch("http://localhost:5100/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: data.text,
      }),
    });
  };
});

// update settings
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type !== "setting") return;
  slackFilter = request.settings;
  sendResponse({ status: "success" });
  localStorage.setItem("slackFilter", JSON.stringify(slackFilter));
});
