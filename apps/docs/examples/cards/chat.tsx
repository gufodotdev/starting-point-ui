export default function Assistant() {
  return (
    <div className="card h-140 w-full max-w-sm gap-0">
      <div className="card-header border-b">
        <div className="card-title">New Chat</div>
        <div className="card-description">How can I help you today?</div>
        <div className="card-action">
          <button id="chat-reset" className="btn btn-outline btn-icon" aria-label="Reset conversation">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </button>
          <div className="tooltip" data-sp-toggle="#chat-reset">Reset</div>
        </div>
      </div>
      <div className="card-content flex-1 overflow-hidden p-0">
        <div className="empty h-full" id="chat-empty">
          <div className="empty-header">
            <div className="empty-media empty-media-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.1 2.182a10 10 0 0 1 3.8 0"/><path d="M13.9 21.818a10 10 0 0 1-3.8 0"/><path d="M17.609 3.72a10 10 0 0 1 2.69 2.7"/><path d="M2.182 13.9a10 10 0 0 1 0-3.8"/><path d="M20.28 17.61a10 10 0 0 1-2.7 2.69"/><path d="M21.818 10.1a10 10 0 0 1 0 3.8"/><path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/><path d="m6.163 21.117-2.906.85a1 1 0 0 1-1.236-1.169l.965-2.98"/></svg>
            </div>
            <div className="empty-title">Morning, John!</div>
            <div className="empty-description">What are we working on today? Type a message to start the conversation</div>
          </div>
        </div>
        <div className="message-scroller hidden size-full" id="chat-scroller" data-sp-auto-scroll>
          <div className="message-scroller-viewport">
            <div className="message-scroller-content p-6" id="chat-content"></div>
          </div>
          <button className="message-scroller-button btn btn-sm btn-icon" aria-label="Scroll to latest">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
          </button>
        </div>
      </div>
      <div className="card-footer">
        <form className="w-full" id="chat-form">
          <div className="input-group">
            <textarea
              className="textarea scrollbar scrollbar-sm max-h-32 min-h-0"
              id="chat-input"
              placeholder="Ask about the scroll behavior..."
              autoComplete="off"
            ></textarea>
            <div className="input-group-addon input-group-addon-block-end pt-1">
              <button id="chat-plus" className="btn btn-outline btn-sm btn-icon" type="button" aria-label="Add files">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </button>
              <button id="chat-send" className="btn btn-sm btn-icon ms-auto" type="submit" aria-label="Send">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              </button>
            </div>
          </div>
        </form>
        <div className="dropdown w-44" data-sp-toggle="#chat-plus" data-sp-placement="top-start">
          <button className="dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/></svg>
            Add Photos &amp; Files
          </button>
          <div className="dropdown-separator"></div>
          <button className="dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            Create Image
          </button>
          <button className="dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/><path d="m13.56 11.747 4.332-.924"/><path d="m16 21-3.105-6.21"/><path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"/><path d="m6.158 8.633 1.114 4.456"/><path d="m8 21 3.105-6.21"/><circle cx="12" cy="13" r="2"/></svg>
            Deep Research
          </button>
          <button className="dropdown-item">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            Web Search
          </button>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
  const chatContent = document.querySelector("#chat-content");
  const chatForm = document.querySelector("#chat-form");
  const chatInput = document.querySelector("#chat-input");
  const chatReset = document.querySelector("#chat-reset");
  const chatSend = document.querySelector("#chat-send");
  const chatEmpty = document.querySelector("#chat-empty");
  const chatScroller = document.querySelector("#chat-scroller");
  const userMessage = (text) => {
    const el = document.createElement("div");
    el.className = "message-scroller-item";
    el.setAttribute("data-sp-anchor", "");
    el.innerHTML = '<div class="message message-end"><div class="message-content"><div class="bubble bubble-muted"><div class="bubble-content"></div></div></div></div>';
    el.querySelector(".bubble-content").textContent = text;
    return el;
  };
  const assistantMessage = () => {
    const el = document.createElement("div");
    el.className = "message-scroller-item";
    el.innerHTML = '<div class="message"><div class="message-content"><div class="bubble bubble-ghost"><div class="bubble-content space-y-2"></div></div></div></div>';
    return el;
  };
  const firstReply = [
    "That's the classic streaming scroll problem. Wrap your message list in a message scroller and turn on auto-scroll: the viewport pins to the bottom as tokens arrive, so users always see the latest text land in place.",
    "The important part: it only auto-scrolls while the reader is already at the bottom. The moment they scroll up to read something earlier, auto-scroll backs off and their position is preserved. You get smooth streaming without fighting the user's intent.",
  ];
  const chatReplies = [
    "New messages keep the thread steady too. Your question just pinned to the top as a turn, and this reply is streaming in below it.",
    "If you scroll up right now, the view stays put. The floating arrow appears so you can jump back down whenever you are ready.",
    "Loading older history works the same way: rows prepended above the viewport never move what you are reading.",
    "All of this is the message scroller with data-sp-auto-scroll, plus bubbles and markers for the conversation itself.",
  ];
  let chatIndex = 0;
  let chatBusy = false;
  let scripted = true;
  const spacer = () => chatContent.lastElementChild;
  const setBusy = (busy) => {
    chatBusy = busy;
    chatReset.disabled = busy;
    chatSend.disabled = busy;
    if (busy) chatContent.setAttribute("aria-busy", "true");
    else chatContent.removeAttribute("aria-busy");
  };
  const streamReply = (paragraphs, done) => {
    const el = assistantMessage();
    const target = el.querySelector(".bubble-content");
    chatContent.insertBefore(el, spacer());
    let index = 0;
    const next = () => {
      if (index >= paragraphs.length) return done();
      const words = paragraphs[index].split(" ");
      const p = document.createElement("p");
      target.append(p);
      let at = 0;
      const stream = setInterval(() => {
        at += 1;
        p.textContent = words.slice(0, at).join(" ");
        if (at >= words.length) {
          clearInterval(stream);
          index += 1;
          next();
        }
      }, 45);
    };
    next();
  };
  const reset = () => {
    [...chatContent.children].slice(0, -1).forEach((el) => el.remove());
    chatEmpty.classList.remove("hidden");
    chatScroller.classList.add("hidden");
    chatInput.value = "";
    chatIndex = 0;
    scripted = true;
  };
  reset();
  chatReset.addEventListener("click", () => {
    if (!chatBusy) reset();
  });
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.requestSubmit();
    }
  });
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text || chatBusy) return;
    setBusy(true);
    chatInput.value = "";
    chatEmpty.classList.add("hidden");
    chatScroller.classList.remove("hidden");
    chatContent.insertBefore(userMessage(text), spacer());
    const typing = document.createElement("div");
    typing.className = "message-scroller-item";
    typing.innerHTML = '<div class="marker" role="status"><span class="marker-content shimmer">Thinking...</span></div>';
    chatContent.insertBefore(typing, spacer());
    setTimeout(() => {
      typing.remove();
      const greeting = /^(hi|hey|hello|yo|hola)\\b/i.test(text);
      let paragraphs;
      if (greeting) {
        paragraphs = ["Hello! Ask about the scroll behavior, or just watch what happens to the thread while I answer."];
      } else if (scripted) {
        scripted = false;
        paragraphs = firstReply;
      } else {
        paragraphs = [chatReplies[chatIndex++ % chatReplies.length]];
      }
      streamReply(paragraphs, () => {
        setBusy(false);
        chatInput.focus();
      });
    }, 900);
  });
`,
        }}
      />
    </div>
  );
}
