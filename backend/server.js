require("dotenv").config();

const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Stripe = require("stripe");

const app = express();
const PORT = Number(process.env.PORT || 10000);
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

let openai = null;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require("openai");
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

let users = [];
const ADMIN_PIN = process.env.ADMIN_PIN || "";

const { createUser, upgradeUser, isPaid, trackUsage, getStats } = require("./revenueSystem");
const { deployProject } = require("./deploy");

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (_req, res) => res.sendFile(path.join(__dirname, "../frontend/index.html")));
app.get("/health", (_req, res) => res.json({ ok: true, service: "multi-ai-deploy" }));

function auth(req, res, next) {
  if (!process.env.JWT_SECRET) return res.status(503).json({ error: "JWT_SECRET is not configured" });
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    req.isAdmin = req.user.admin === true;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

function signToken(payload) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });
}

app.post("/register", async (req, res) => {
  const username = typeof req.body?.username === "string" ? req.body.username.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!/^[a-zA-Z0-9_.-]{3,40}$/.test(username) || password.length < 12 || password.length > 200) {
    return res.status(400).json({ error: "Use a 3–40 character username and a password of at least 12 characters" });
  }
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: "Username already exists" });
  }
  try {
    const hashed = await bcrypt.hash(password, 12);
    users.push({ username, password: hashed });
    createUser(username);
    res.status(201).json({ message: "Registered", token: signToken({ username }) });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find(u => u.username === username);
  if (!user || typeof password !== "string" || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  try {
    res.json({ token: signToken({ username: user.username }) });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.post("/admin-login", (req, res) => {
  if (!ADMIN_PIN || !process.env.JWT_SECRET) {
    return res.status(503).json({ error: "Set ADMIN_PIN and JWT_SECRET in the server environment" });
  }
  if (typeof req.body?.pin !== "string" || req.body.pin !== ADMIN_PIN) {
    return res.status(401).json({ error: "Invalid administrator PIN" });
  }
  res.json({ token: signToken({ admin: true }) });
});

app.post("/admin-change-pin", auth, (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Administrator access required" });
  return res.status(409).json({ error: "Change ADMIN_PIN in the hosting environment, then restart the service" });
});

function requirePaid(req, res, next) {
  if (req.isAdmin) return next();
  if (!req.user?.username || !isPaid(req.user.username)) {
    return res.status(403).json({ error: "An active subscription is required" });
  }
  next();
}

app.post("/create-checkout", auth, async (req, res) => {
  if (req.isAdmin) return res.json({ message: "Administrator access does not require checkout" });
  if (!stripe || !process.env.STRIPE_PRICE_ID || !process.env.BASE_URL) {
    return res.status(503).json({ error: "Stripe environment settings are incomplete" });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: process.env.BASE_URL + "/success",
      cancel_url: process.env.BASE_URL + "/cancel",
      client_reference_id: req.user.username
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(502).json({ error: "Unable to create checkout session" });
  }
});

// A browser redirect is not proof of payment. Subscription status must only be
// updated by a verified Stripe webhook, which is intentionally not enabled yet.
app.get("/success", (_req, res) => {
  res.status(200).send("Checkout returned. Subscription activation is pending verified payment confirmation.");
});

app.post("/chat", auth, requirePaid, async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "A message is required" });
  if (message.length > 12000) return res.status(413).json({ error: "Message is too long" });
  if (!openai) return res.status(503).json({ error: "OPENAI_API_KEY is not configured" });
  trackUsage(req.user.username);
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: message }]
    });
    res.json({ reply: completion.choices?.[0]?.message?.content || "" });
  } catch (err) {
    res.status(502).json({ error: "AI request failed" });
  }
});

app.get("/dashboard", auth, (req, res) => {
  res.json({ user: req.user.username || "admin", message: "Welcome to SaaS" });
});

app.get("/admin-stats", auth, (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Administrator access required" });
  res.json(getStats());
});

app.post("/deploy", auth, async (req, res) => {
  if (!req.isAdmin) return res.status(403).json({ error: "Administrator approval required" });
  const platform = typeof req.body?.platform === "string" ? req.body.platform : "github";
  try {
    await deployProject(platform);
    res.json({ status: "Deployment requested", platform });
  } catch (err) {
    res.status(502).json({ error: "Deployment failed" });
  }
});

app.use((err, _req, res, _next) => {
  console.error("Request failed:", err.message);
  res.status(400).json({ error: "Invalid request" });
});

app.listen(PORT, "0.0.0.0", () => console.log("Multi-AI Deploy listening on " + PORT));
