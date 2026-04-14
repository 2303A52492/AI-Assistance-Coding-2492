/*
 * ============================================================
 *  DocuGenius AI — AI-Powered Code Documentation Generator
 *  FILE: server.js
 *  PURPOSE: Express server that serves the frontend and
 *           exposes API endpoints for documentation generation.
 * ============================================================
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { generateDocumentation, fixCode } = require("./services/aiService");

// ── Initialize Express App ──────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors()); // Enable CORS for all origins
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies (large code inputs)
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend files

// ── API Routes ─────────────────────────────────────────────

/**
 * POST /api/generate-docs
 *
 * Generates documentation for the provided code.
 *
 * Request Body:
 *   - code (string, required): The source code to document
 *   - language (string, optional): Programming language (auto-detected if omitted)
 *   - format (string, optional): "inline" | "markdown" | "readme" (default: "markdown")
 *   - apiKey (string, optional): Gemini API key (overrides .env)
 *
 * Response:
 *   - success (boolean): Whether generation succeeded
 *   - documentation (string): The generated documentation
 *   - format (string): The format used
 */
app.post("/api/generate-docs", async (req, res) => {
  try {
    const { code, language, format, docStyle, apiKey } = req.body;

    // ── Input Validation ──
    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Code input is required. Please paste your code and try again.",
      });
    }

    if (code.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error:
          "Code is too short. Please provide a meaningful code snippet (at least 10 characters).",
      });
    }

    // Validate format parameter
    const validFormats = ["inline", "markdown", "readme", "visualize"];
    const selectedFormat = validFormats.includes(format) ? format : "markdown";

    // ── Generate Documentation via AI ──
    const result = await generateDocumentation(
      code.trim(),
      language || "",
      selectedFormat,
      docStyle || "standard",
      apiKey
    );

    res.json(result);
  } catch (error) {
    console.error("API Error:", error.message);

    // Determine appropriate status code based on error type
    const statusCode = error.message.includes("API key") ? 401 : 500;

    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/auto-fix
 *
 * Uses AI to fix syntax errors in the provided code.
 *
 * Request Body:
 *   - code (string, required): The source code with syntax errors
 *   - language (string, optional): Programming language
 *   - apiKey (string, optional): Gemini API key (overrides .env)
 *
 * Response:
 *   - success (boolean): Whether fixing succeeded
 *   - fixedCode (string): The corrected code
 */
app.post("/api/auto-fix", async (req, res) => {
  try {
    const { code, language, apiKey } = req.body;

    if (!code || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Code input is required.",
      });
    }

    if (code.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "Code is too short to fix.",
      });
    }

    const result = await fixCode(code.trim(), language || "", apiKey);
    res.json(result);
  } catch (error) {
    console.error("Auto-fix Error:", error.message);
    const statusCode = error.message.includes("API key") ? 401 : 500;
    res.status(statusCode).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/health
 *
 * Health check endpoint to verify the server is running.
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "DocuGenius AI",
    timestamp: new Date().toISOString(),
  });
});

// ── Fallback: Serve index.html for any non-API route ────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({
    success: false,
    error: "An unexpected error occurred. Please try again.",
  });
});

// ── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   🚀 DocuGenius AI Server is Running!        ║
  ║                                              ║
  ║   Local:  http://localhost:${PORT}              ║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
  `);
});
