require("dotenv").config();

const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Stripe = require("stripe");
const fs = require("fs");

const app = express();
app.use(express.json());

// ===== OPTIONAL OPENAI (NO CRASH) =====
let openai = null;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require("openai");
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ===== STRIPE =====
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===== SIMPLE DB =====
let users = [];
let ADMIN_PIN = "20252025";

// ===== REVENUE SYSTEM =====
const {
  createUser,
  upgradeUser,
  isPaid,
  trackUsage,
  getStats
} = require("./revenueSystem");

// ===== SERVE FRONTEND =====
app.use(express.static(path.join(__dirname, "../frontend")));

// ===== AUTH =====
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });

  createUser(username);

  res.send("✅ Registered");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).send("❌ No user");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send("❌ Wrong password");

  const token = jwt.sign({ username }, process.env.JWT_SECRET);
  res.json({ token });
});

// ===== ADMIN LOGIN =====
app.post("/admin-login", (req, res) => {
  const { pin } = req.body;

  if (pin === ADMIN_PIN) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET);
    return res.json({ token });
  }

  res.status(401).send("❌ Wrong PIN");
});

// ===== CHANGE PIN =====
app.post("/admin-change-pin", (req, res) => {
  ADMIN_PIN = req.body.newPin;
  res.send("✅ PIN updated");
});

// ===== AUTH MIDDLEWARE =====
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).send("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (decoded.admin) req.isAdmin = true;

    next();
  } catch {
    res.status(401).send("Invalid token");
  }
}

// ===== PAYWALL =====
function requirePaid(req, res, next) {
  if (req.isAdmin) return next();

  const username = req.user.username;

  if (!isPaid(username)) {
    return res.status(403).send("💳 Upgrade required");
  }

  next();
}

// ===== STRIPE =====
app.post("/create-checkout", auth, async (req, res) => {
  if (req.isAdmin) {
    return res.send("👑 Admin free access");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: process.env.BASE_URL + "/success?user=" + req.user.username,
    cancel_url: process.env.BASE_URL + "/cancel"
  });

  res.json({ url: session.url });
});

// ===== SUCCESS =====
app.get("/success", (req, res) => {
  const username = req.query.user;
  if (username) upgradeUser(username);

  res.send("🎉 Subscription active!");
});

// ===== CHAT (MONETIZED AI) =====
app.post("/chat", auth, requirePaid, async (req, res) => {
  const { message } = req.body;

  trackUsage(req.user.username);

  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: message }]
      });

      return res.send(completion.choices[0].message.content);
    } catch (e) {
      console.error(e);
    }
  }

  res.send("🤖 AI offline");
});

// ===== DASHBOARD =====
app.get("/dashboard", auth, (req, res) => {
  res.json({
    user: req.user.username || "admin",
    message: "Welcome to SaaS 🚀"
  });
});

// ===== ADMIN STATS =====
app.get("/admin-stats", auth, (req, res) => {
  if (!req.isAdmin) return res.status(403).send("Admin only");

  res.json(getStats());
});

// ===== DEPLOY (KEEP YOUR SYSTEM) =====
const { deployProject } = require("./deploy");

app.post("/deploy", async (req, res) => {
  const platform = req.body.platform || "github";
  await deployProject(platform);
  res.send("🚀 Deployed to " + platform);
});

// ===== FALLBACK =====
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ===== START =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 SaaS running on " + PORT));
