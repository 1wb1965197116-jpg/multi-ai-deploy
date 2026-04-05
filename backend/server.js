require("dotenv").config();

const express = require("express");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
app.use(express.json());

// ===== IN-MEMORY DB (simple) =====
let users = [];
let encryptedKey = "";

// ===== IMPORTS =====
const { deployProject } = require("./deploy");
const { getProjectStatus, checkAndFixProject } = require("./deployChecker");
const { detectProjectType, buildProject } = require("./aiAgents");

// ===== SERVE FRONTEND =====
app.use(express.static(path.join(__dirname, "../frontend")));

// ===== AUTH =====
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  users.push({ username, password });
  res.send("✅ User registered");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) return res.send("✅ Login success");
  res.status(401).send("❌ Invalid login");
});

// ===== DASHBOARD =====
app.get("/dashboard", (req, res) => {
  res.json({
    users: users.length,
    status: "SaaS Running",
    revenue: "$0 (connect Stripe)"
  });
});

// ===== STRIPE PLACEHOLDER =====
app.post("/create-checkout", (req, res) => {
  res.send("💳 Stripe checkout placeholder (add real Stripe API key)");
});

// ===== AI BUILD =====
app.post("/ai-build", (req, res) => {
  const { code } = req.body;
  const root = path.join(__dirname, "..");

  const type = detectProjectType(code);
  buildProject(type, root, code);

  res.send(`🤖 Built ${type} app`);
});

// ===== SAAS BUILDER =====
app.post("/saas-build", (req, res) => {
  const { prompt } = req.body;
  const projectPath = path.join(__dirname, "../generated-app");

  if (!fs.existsSync(projectPath)) fs.mkdirSync(projectPath);

  fs.writeFileSync(
    path.join(projectPath, "index.html"),
    `<h1>${prompt}</h1><p>SaaS App Running</p>`
  );

  res.send("🚀 SaaS Generated");
});

// ===== STATUS =====
app.get("/status", (req, res) => {
  const status = getProjectStatus(path.join(__dirname, ".."));
  res.json(status);
});

// ===== FIX =====
app.post("/fix", (req, res) => {
  checkAndFixProject(path.join(__dirname, ".."));
  res.send("✅ Fixed");
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

  let reply = "🤖 SaaS system ready.";

  if (msg.includes("money")) reply = "Connect Stripe to start earning.";
  if (msg.includes("build")) reply = "Use AI Build or SaaS Builder.";
  if (msg.includes("deploy")) reply = "Choose a platform and deploy.";

  res.send(reply);
});

// ===== API KEY =====
app.post("/save-key", (req, res) => {
  const cipher = crypto.createCipher("aes-256-ctr", "secret123");
  encryptedKey =
    cipher.update(req.body.key, "utf8", "hex") + cipher.final("hex");

  res.send("🔐 Key saved");
});

// ===== FALLBACK =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ===== START =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 Running on " + PORT));
