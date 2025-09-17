// index.js
// Minimal Express API with a health check

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors()); // allow requests from any origin
app.use(express.json()); // parse JSON request bodies

// Health check route
app.get("/api/health", (req, res) => {
  return res.json({ ok: true });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});
