let platform = "github";

// ===== AUTH =====
async function register() {
  await fetch("/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  });
  alert("Registered");
}

async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  });

  alert(await res.text());
}

// ===== DASHBOARD =====
async function loadDashboard() {
  const res = await fetch("/dashboard");
  const data = await res.json();

  dashboard.innerHTML = `
    Users: ${data.users}<br>
    Revenue: ${data.revenue}<br>
    Status: ${data.status}
  `;
}

// ===== MONETIZATION =====
async function checkout() {
  const res = await fetch("/create-checkout", { method: "POST" });
  alert(await res.text());
}

// ===== AI BUILD =====
async function aiBuild() {
  const code = fileContent.value;

  const res = await fetch("/ai-build", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ code })
  });

  output.innerText = await res.text();
}

// ===== SAAS =====
async function buildSaaS() {
  const res = await fetch("/saas-build", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ prompt: saasPrompt.value })
  });

  output.innerText = await res.text();
}

// ===== DEPLOY =====
function deploy(p) {
  platform = p;
}

async function checkBeforeDeploy() {
  const res = await fetch("/status");
  const data = await res.json();

  let hasError = data.some(d => d.color === "red");

  if (hasError) {
    if (confirm("Fix project?")) {
      await fetch("/fix", { method: "POST" });
    }
  }

  runDeploy();
}

async function runDeploy() {
  const res = await fetch("/deploy", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ platform })
  });

  output.innerText = await res.text();
}

// ===== CHAT =====
async function sendChat() {
  const msg = chatInput.value;

  const res = await fetch("/chat", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ message: msg })
  });

  const reply = await res.text();

  chatBox.innerHTML += `<div>🧑 ${msg}</div>`;
  chatBox.innerHTML += `<div>🤖 ${reply}</div>`;
}

// ===== DRAG DROP =====
dropZone.ondrop = e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];

  const reader = new FileReader();
  reader.onload = () => {
    fileContent.value = reader.result;
  };
  reader.readAsText(file);
};

dropZone.ondragover = e => e.preventDefault();
