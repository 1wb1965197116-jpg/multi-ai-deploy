const express = require("express");
const path = require("path");
const { deployProject } = require("./deploy");

const app = express();

// Middleware
app.use(express.json());

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ API test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working!" });
});

// ✅ DEPLOY ROUTE (AI auto-fix + deploy)
app.post("/deploy", async (req, res) => {
  try {
    await deployProject("my-project");
    res.send("✅ Project checked, fixed, and deployed!");
  } catch (error) {
    console.error(error);
    res.status(500).send("❌ Deployment failed");
  }
});

// ✅ Catch-all → fixes “Not Found”
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 Server running on port " + PORT));
