require("dotenv").config();

const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express(); // ✅ THIS WAS MISSING

// ===== IMPORTS =====
const { deployProject } = require("./deploy");
const { getProjectStatus, checkAndFixProject } = require("./deployChecker");
const { detectProjectType, buildProject } = require("./aiAgents");

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// ===== TEST =====
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working!" });
});

// ===== AI BUILD =====
app.post("/ai-build", (req, res) => {
  const { code } = req.body;
  const root = path.join(__dirname, "..");

  const type = detectProjectType(code);
  buildProject(type, root, code);

  res.send(`🤖 Built ${type} app`);
});

// ===== STATUS =====
app.get("/status", (req, res) => {
  const status = getProjectStatus(path.join(__dirname, ".."));
  res.json(status);
});

// ===== FIX PROJECT =====
app.post("/fix", (req, res) => {
  checkAndFixProject(path.join(__dirname, ".."));
  res.send("✅ Project fixed");
});

// ===== DEPLOY =====
app.post("/deploy", async (req, res) => {
  try {
    const platform = req.body.platform || "github";
    await deployProject(platform);
    res.send("🚀 Deployed to " + platform);
  } catch (e) {
    console.error(e);
    res.status(500).send("❌ Deploy failed");
  }
});

// ===== CHATBOT =====
app.post("/chat", (req, res) => {
  const msg = req.body.message;

  let reply = "🤖 Ready to build and deploy apps.";

  if (msg.includes("build")) {
    reply = "Paste code and press AI Build.";
  }

  if (msg.includes("deploy")) {
    reply = "Choose platform and press Deploy.";
  }

  res.send(reply);
});

// ===== API KEY ENCRYPT =====
let encryptedKey = "";

app.post("/save-key", (req, res) => {
  const cipher = crypto.createCipher("aes-256-ctr", "secret123");
  encryptedKey =
    cipher.update(req.body.key, "utf8", "hex") + cipher.final("hex");

  res.send("🔐 Key saved");
});

app.post("/use-key", (req, res) => {
  const decipher = crypto.createDecipher("aes-256-ctr", "secret123");
  const decrypted =
    decipher.update(encryptedKey, "hex", "utf8") + decipher.final("utf8");

  console.log("Using key:", decrypted);
  res.send("✅ Key executed");
});

// ===== FIX NOT FOUND =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 Running on port " + PORT));
