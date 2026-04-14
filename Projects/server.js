/*
 * ============================================================
 * DocuGenius AI — AI-Powered Code Documentation Generator
 * FILE: server.js
 * ============================================================
 */
const express = require("express");
const cors = require("cors");
const path = require("path");

// Only load dotenv if not in production (Vercel provides variables automatically)
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config();
}

const { generateDocumentation, fixCode } = require("./services/aiService");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// ── API Routes ─────────────────────────────────────────────

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        service: "DocuGenius AI",
        timestamp: new Date().toISOString(),
    });
});

/**
 * POST /api/generate-docs
 */
app.post("/api/generate-docs", async (req, res) => {
    try {
        const { code, language, format, docStyle, apiKey } = req.body;

        if (!code || code.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Code input is required.",
            });
        }

        const validFormats = ["inline", "markdown", "readme", "visualize"];
        const selectedFormat = validFormats.includes(format) ? format : "markdown";

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
        const statusCode = error.message.includes("API key") ? 401 : 500;
        res.status(statusCode).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/auto-fix
 */
app.post("/api/auto-fix", async (req, res) => {
    try {
        const { code, language, apiKey } = req.body;
        if (!code || code.trim().length === 0) {
            return res.status(400).json({ success: false, error: "Code input is required." });
        }

        const result = await fixCode(code.trim(), language || "", apiKey);
        res.json(result);
    } catch (error) {
        console.error("Auto-fix Error:", error.message);
        const statusCode = error.message.includes("API key") ? 401 : 500;
        res.status(statusCode).json({ success: false, error: error.message });
    }
});

// ── Fallback: Serve index.html for any non-API route ────────
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ── Start Server ────────────────────────────────────────────
// Note: Vercel handles the listening in serverless mode, 
// but this keeps it compatible with local development.
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
