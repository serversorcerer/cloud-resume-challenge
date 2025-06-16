// Minimal JS for josephaleto.io
// Fetch view count and update counter element
window.addEventListener('DOMContentLoaded', () => {
  const counter = document.querySelector('.counter-number');
  if (!counter) return;
  fetch('https://p2g657yagqa4o4llp63id3dmgq0xzcun.lambda-url.us-east-1.on.aws/')
    .then(r => r.json())
    .then(data => { counter.textContent = `Views: ${data.views}`; })
    .catch(() => {});
});

// Enhance terminal response formatting for ASCII diagrams
function createTerminalResponse(resp) {
  const response = document.createElement("div");
  if (resp.includes('<img')) {
    response.innerHTML = resp;
  } else {
    response.innerHTML = `<pre style="white-space: pre-wrap; overflow-x: auto; color:#33ff33;">${resp}</pre>`;
  }
  return response;
}
