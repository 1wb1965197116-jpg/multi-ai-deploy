document.getElementById("deployBtn").onclick = async () => {
  const output = document.getElementById("output");
  output.innerHTML = "Checking project...";

  const res = await fetch("/deploy", { method: "POST" });
  const data = await res.text();

  output.innerHTML = data;
};
