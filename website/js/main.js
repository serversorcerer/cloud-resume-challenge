// Minimal JS for josephaleto.io
// Fetch view count and update counter element
window.addEventListener('DOMContentLoaded', () => {
  const counter = document.querySelector('.counter-number');
  if (!counter) return;
  fetch('https://p2g657yagqa4o4llp63id3dmgq0xzcun.lambda-url.us-east-1.on.aws/')
    .then(r => r.json())
    .then(data => { counter.innerHTML = `<pre style="white-space: pre-wrap; overflow-x: auto;">Views: ${data.views}</pre>`; })
    .catch(() => {});
});

// Enhance terminal response formatting for ASCII diagrams
function createTerminalResponse(resp) {
  if (resp.includes('<img')) {
    const container = document.createElement("div");
    container.innerHTML = resp;
    return container;
  } else {
    const pre = document.createElement("pre");
    pre.textContent = resp;
    pre.classList.add("terminal-output");
    return pre;
  }
}
