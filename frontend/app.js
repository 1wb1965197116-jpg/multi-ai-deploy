// ===== GLOBAL =====
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

  alert("✅ Registered");
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

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("✅ Logged in");
  } else {
    alert("❌ Login failed");
  }
}

// ===== DASHBOARD =====
async function loadDashboard() {
  const res = await fetch("/dashboard", {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  });

  const data = await res.json();

  dashboard.innerHTML = `
    <b>User:</b> ${data.user || "N/A"}<br>
    <b>Message:</b> ${data.message || "No data"}
  `;
}

// ===== STRIPE =====
async function checkout() {
  const res = await fetch("/create-checkout", {
    method: "POST"
  });

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("❌ Stripe error");
  }
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

// ===== SAAS BUILDER =====
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
  output.innerText = "Selected platform: " + p;
}

async function checkBeforeDeploy() {
  const res = await fetch("/status");
  const data = await res.json();

  let hasError = data.some(d => d.color === "red");

  if (hasError) {
    const fix = confirm("⚠️ Files incomplete. Fix automatically?");
    if (fix) {
      await fetch("/fix", { method: "POST" });
    }
  }

  runDeploy();
}

async function runDeploy() {
  output.innerText = "🚀 Deploying...";

  const res = await fetch("/deploy", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ platform })
  });

  output.innerText = await res.text();
}

// ===== CHATBOT =====
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

// ===== DRAG & DROP =====
dropZone.ondragover = e => {
  e.preventDefault();
  dropZone.style.background = "#222";
};

dropZone.ondrop = e => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];

  const reader = new FileReader();
  reader.onload = () => {
    fileContent.value = reader.result;
  };

  reader.readAsText(file);
};

// ===== STATUS CHECK (OPTIONAL BUTTON SUPPORT) =====
async function checkStatus() {
  const res = await fetch("/status");
  const data = await res.json();

  output.innerHTML = "";

  data.forEach(d => {
    output.innerHTML += `<div style="color:${d.color}">${d.msg}</div>`;
  });
}
