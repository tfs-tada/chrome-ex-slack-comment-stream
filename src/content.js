let wsFlag = null;
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!!wsFlag) return;
  wsFlag = true;
  const socket = new WebSocket(request.data);
  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type !== "message") return;
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
