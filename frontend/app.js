let platform = "github";

// ===== AUTH =====
async function register() {
  await fetch("/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username: user.value, password: pass.value })
  });
  alert("Registered");
}

async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ username: user.value, password: pass.value })
  });

  const data = await res.json();
  localStorage.setItem("token", data.token);
  alert("Logged in");
}

// ===== ADMIN =====
async function adminLogin() {
  const res = await fetch("/admin-login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ pin: adminPin.value })
  });

  const data = await res.json();
  localStorage.setItem("token", data.token);
  alert("Admin logged in");
}

// ===== DASHBOARD =====
async function loadDashboard() {
  const res = await fetch("/dashboard", {
    headers: { Authorization: localStorage.getItem("token") }
  });

  const data = await res.json();
  output.innerText = JSON.stringify(data, null, 2);
}

// ===== ADMIN STATS =====
async function loadAdminStats() {
  const res = await fetch("/admin-stats", {
    headers: { Authorization: localStorage.getItem("token") }
  });

  output.innerText = JSON.stringify(await res.json(), null, 2);
}

// ===== STRIPE =====
async function checkout() {
  const res = await fetch("/create-checkout", {
    method: "POST",
    headers: { Authorization: localStorage.getItem("token") }
  });

  const data = await res.json();
  if (data.url) window.location.href = data.url;
}

// ===== CHAT =====
async function sendChat() {
  const res = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      Authorization: localStorage.getItem("token")
    },
    body: JSON.stringify({ message: chatInput.value })
  });

  chatBox.innerHTML += `<div>${await res.text()}</div>`;
}

// ===== DEPLOY =====
function deploy(p) { platform = p; }

async function runDeploy() {
  const res = await fetch("/deploy", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ platform })
  });

  output.innerText = await res.text();
}
