const express = require("express");
const path = require("path");
const app = express();

// Middleware
app.use(express.json());

// ✅ Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Test API
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working" });
});

// ✅ Catch ALL routes → send index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Running on port " + PORT));
