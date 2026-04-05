const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// API test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working!" });
});

// Fallback to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
