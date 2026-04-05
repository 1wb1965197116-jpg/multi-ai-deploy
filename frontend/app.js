let selectedPlatform = "github";

function deploy(platform) {
  selectedPlatform = platform;
  document.getElementById("output").innerText = "Selected: " + platform;
}

async function checkBeforeDeploy() {
  const res = await fetch("/status");
  const data = await res.json();

  const statusBox = document.getElementById("statusBox");
  statusBox.innerHTML = "";

  let hasError = false;

  data.forEach(s => {
    const d = document.createElement("div");
    d.innerText = s.msg;
    d.style.color = s.color;
    statusBox.appendChild(d);

    if (s.color === "red") hasError = true;
  });

  if (hasError) {
    document.getElementById("fixPrompt").style.display = "block";
  } else {
    runDeploy();
  }
}

async function fixProject() {
  document.getElementById("output").innerText = "AI fixing project...";
  await fetch("/fix", { method: "POST" });
  runDeploy();
}

function cancelFix() {
  document.getElementById("fixPrompt").style.display = "none";
}

async function runDeploy() {
  document.getElementById("output").innerText = "Deploying...";

  const res = await fetch("/deploy", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ platform: selectedPlatform })
  });

  document.getElementById("output").innerText = await res.text();
}

// Drag & Drop
const drop = document.getElementById("dropZone");

drop.ondragover = e => {
  e.preventDefault();
  drop.style.background = "#222";
};

drop.ondrop = e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];

  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("fileContent").value = reader.result;
  };
  reader.readAsText(file);
};

// API KEY
async function saveKey() {
  const key = document.getElementById("apiKey").value;

  await fetch("/save-key", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ key })
  });

  alert("🔐 Saved");
}

async function runWithKey() {
  await fetch("/use-key", { method: "POST" });
  alert("✅ Executed");
}
