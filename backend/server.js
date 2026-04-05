require("dotenv").config();

const express = require("express");
const path = require("path");
const crypto = require("crypto");

const { deployProject } = require("./deploy");
const { getProjectStatus } = require("./deployChecker");

const app = express();
app.use(express.json());

// ===== Serve frontend =====
app.use(express.static(path.join(__dirname, "../frontend")));

// ===== API TEST =====
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working!" });
});

// ===== DEPLOY =====
app.post("/deploy", async (req, res) => {
  try {
    await deployProject("my-project");
    res.send("✅ Project checked, fixed, and deployed!");
  } catch (e) {
    console.error(e);
    res.status(500).send("❌ Deploy failed");
  }
});

// ===== STATUS =====
app.get("/status", (req, res) => {
  const status = getProjectStatus(path.join(__dirname, ".."));
  res.json(status);
});

// ===== ENCRYPTED KEY =====
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 Running on " + PORT));
