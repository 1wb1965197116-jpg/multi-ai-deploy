require("dotenv").config();

const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Stripe = require("stripe");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ===== TEMP DB (replace with Supabase later)
let users = [];

// ===== SERVE FRONTEND
app.use(express.static(path.join(__dirname, "../frontend")));

// ===== AUTH =====
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });

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

// ===== MIDDLEWARE =====
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).send("No token");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
}

// ===== STRIPE =====
app.post("/create-checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1
      }
    ],
    success_url: "https://your-site.onrender.com/success",
    cancel_url: "https://your-site.onrender.com/cancel"
  });

  res.json({ url: session.url });
});

// ===== AI CHAT (REAL GPT) =====
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: message }]
  });

  res.send(completion.choices[0].message.content);
});

// ===== PROTECTED DASHBOARD =====
app.get("/dashboard", auth, (req, res) => {
  res.json({
    user: req.user.username,
    message: "Welcome to SaaS Dashboard 🚀"
  });
});

// ===== DEPLOY (KEEP YOUR EXISTING LOGIC)
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
app.listen(PORT, () => console.log("🚀 Production SaaS running on " + PORT));
