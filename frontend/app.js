async function deploy() {
  const res = await fetch("/deploy", { method: "POST" });
  document.getElementById("output").innerText = await res.text();
}

async function checkStatus() {
  const res = await fetch("/status");
  const data = await res.json();

  const out = document.getElementById("output");
  out.innerHTML = "";

  data.forEach(s => {
    const d = document.createElement("div");
    d.innerText = s.msg;
    d.style.color = s.color;
    out.appendChild(d);
  });
}

// drag drop
const drop = document.getElementById("dropZone");

drop.ondrop = e => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];

  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("fileContent").value = reader.result;
  };
  reader.readAsText(file);
};

drop.ondragover = e => e.preventDefault();

async function saveKey() {
  const key = document.getElementById("apiKey").value;

  await fetch("/save-key", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ key })
  });

  alert("Saved");
}
