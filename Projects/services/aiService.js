/*
 * ============================================================
 *  DocuGenius AI — AI-Powered Code Documentation Generator
 *  FILE: services/aiService.js
 *  PURPOSE: Handles all communication with Google Gemini API
 *           to generate code documentation in various formats.
 * ============================================================
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize the Gemini AI client with the API key from environment variables
let genAI = null;

/**
 * Gets or creates the GoogleGenerativeAI instance.
 * Supports both server-side .env key and client-provided key.
 * @param {string} [apiKey] - Optional API key (overrides .env)
 * @returns {GoogleGenerativeAI} The initialized AI client
 */
function getAIClient(apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key || key === "your_api_key_here") {
    throw new Error(
      "Gemini API key is not configured. Please add your API key to the .env file or provide it through the UI."
    );
  }
  return new GoogleGenerativeAI(key);
}

/**
 * Builds a tailored prompt based on the desired documentation format.
 *
 * @param {string} code - The source code to document
 * @param {string} language - Programming language (e.g., "python", "javascript")
 * @param {string} format - Output format: "inline", "markdown", or "readme"
 * @returns {string} The crafted prompt for the AI model
 */
function buildPrompt(code, language, format, docStyle) {
  const languageLabel = language || "auto-detected";

  // ── Doc style instructions injected into each prompt ──
  const styleInstructions = {
    standard: "",
    jsdoc:    "Use JSDoc format for all comments and docstrings (/** @param {type} name - desc */, @returns, @throws, @example tags).",
    pydoc:    "Use PyDoc / Python docstring conventions (triple-quoted docstrings, Args:, Returns:, Raises:, Example: sections).",
    google:   "Use Google Style docstrings (Args:, Returns:, Raises: sections with indented descriptions, no types in parentheses).",
    doxygen:  "Use Doxygen format for all comments (\\brief, \\param, \\return, \\throws, \\code tags).",
  };
  const styleNote = styleInstructions[docStyle] || "";

  // ── Prompt templates for each documentation format ──

  const prompts = {
    // INLINE: Returns the original code with added docstrings, comments, and type hints
    inline: `You are an expert code documentation assistant.

Given the following ${languageLabel} code, add comprehensive inline documentation:
- Add a file-level docstring/comment explaining the module purpose
- Add function/method docstrings with parameter descriptions, return types, and usage examples
- Add inline comments for complex logic blocks
- Add type hints/annotations where applicable
- Preserve the original code exactly — only ADD documentation
${styleNote ? "- " + styleNote : ""}
Return ONLY the documented code, no explanations outside the code block.

\`\`\`${language || ""}
${code}
\`\`\``,

    // MARKDOWN: Returns structured Markdown documentation
    markdown: `You are an expert technical documentation writer.
${styleNote ? styleNote + "\n" : ""}
Given the following ${languageLabel} code, generate comprehensive Markdown documentation:

## Required Sections:
1. **Overview** — Brief description of what this code does
2. **Dependencies** — Any imports/libraries used
3. **Functions/Classes Reference** — For each function/class:
   - Description
   - Parameters table (Name | Type | Description | Default)
   - Return value
   - Usage example with code block
4. **Code Flow** — Step-by-step explanation of the logic
5. **Usage Examples** — 2-3 practical examples showing how to use this code

Format everything in clean, professional Markdown. Use tables for parameters, code blocks for examples.

\`\`\`${language || ""}
${code}
\`\`\``,

    // README: Returns a full project README.md
    readme: `You are an expert open-source documentation writer.
${styleNote ? styleNote + "\n" : ""}
Given the following ${languageLabel} code, generate a professional README.md file:

## Required Sections:
1. **Project Title** — with a short catchy tagline
2. **Badges** — (use shields.io style badges for language, license, etc.)
3. **Overview** — What problem this solves and how
4. **Features** — Bulleted list of key features
5. **Installation** — Step-by-step setup instructions
6. **Usage** — Code examples showing how to use it
7. **API Reference** — Functions/methods with parameters and return values
8. **Configuration** — Any environment variables or config options
9. **Contributing** — How others can contribute
10. **License** — MIT License

Make it visually appealing with emojis, clean formatting, and professional tone.

\`\`\`${language || ""}
${code}
\`\`\``,

    // VISUALIZE: Returns Mermaid.js flowchart diagram
    visualize: `You are a software architecture visualization expert.

Analyze the following ${languageLabel} code and generate a Mermaid.js flowchart diagram.

Requirements:
- Use "flowchart TD" (top-down direction)
- Show the main execution entry point as the starting node
- Show all function/method definitions as labeled nodes or subgraphs
- Show branches (if/else, switch/case) using diamond-shaped decision nodes with Yes/No edge labels
- Show loops (for, while, forEach, map) as looping edges back to a node
- Show function calls between functions with directed edges labeled with the call
- Show return points clearly
- Show exception paths (try/catch) if present
- Keep node labels concise (max 6 words per node)
- Use A, B, C... style node IDs

Return ONLY valid Mermaid diagram syntax starting with "flowchart TD".
Do NOT include any markdown code fences, backticks, or commentary outside the diagram itself.

\`\`\`${language || ""}
${code}
\`\`\``,
  };

  return prompts[format] || prompts.markdown;
}

/**
 * Generates documentation for the given code using Google Gemini API.
 *
 * @param {string} code - The source code to document
 * @param {string} language - Programming language identifier
 * @param {string} format - Output format: "inline", "markdown", or "readme"
 * @param {string} [apiKey] - Optional API key (overrides .env)
 * @returns {Promise<{success: boolean, documentation: string, format: string}>}
 */
async function generateDocumentation(code, language, format, docStyle, apiKey) {
  // Model fallback chain: try models in order until one works
  const MODELS = [
    "gemini-2.5-flash",
    "gemma-3-4b-it",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro",
  ];

  const client = getAIClient(apiKey);
  const prompt = buildPrompt(code, language, format, docStyle || "standard");

  let lastError = null;

  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const documentation = response.text();
      console.log(`Success with model: ${modelName}`);
      return { success: true, documentation, format };
    } catch (error) {
      console.error(`Model ${modelName} failed:`, error.message);
      lastError = error;
      // If it's an auth/key error, don't try other models
      if (error.message.includes('API_KEY') || error.message.includes('401') || error.message.includes('403')) {
        throw new Error(`API key error: ${error.message}`);
      }
      // Otherwise try next model
    }
  }

  // All models failed
  throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Fixes syntax errors in the provided code using Google Gemini API.
 *
 * @param {string} code - The source code with potential syntax errors
 * @param {string} language - Programming language identifier
 * @param {string} [apiKey] - Optional API key (overrides .env)
 * @returns {Promise<{success: boolean, fixedCode: string}>}
 */
async function fixCode(code, language, apiKey) {
  const MODELS = [
    "gemini-2.5-flash",
    "gemma-3-4b-it",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro",
  ];

  const client = getAIClient(apiKey);
  const languageLabel = language || "auto-detected";

  const prompt = `You are a code repair assistant. Fix all syntax errors in the following ${languageLabel} code.

Rules:
- Fix unbalanced brackets, parentheses, and braces
- Fix unclosed string literals
- Fix obvious typos in keywords
- Preserve the original logic and structure as much as possible
- Return ONLY the corrected code with no explanations, no markdown fences, no comments about what was changed

\`\`\`${language || ""}
${code}
\`\`\``;

  let lastError = null;

  for (const modelName of MODELS) {
    try {
      console.log(`[auto-fix] Trying model: ${modelName}`);
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let fixedCode = response.text().trim();

      // Extract code block even if the AI included chatty text before/after
      const fenceMatch = fixedCode.match(/```(?:[\w]*)\n([\s\S]*?)\n```/);
      if (fenceMatch) {
        fixedCode = fenceMatch[1].trim();
      }

      console.log(`[auto-fix] Success with model: ${modelName}`);
      return { success: true, fixedCode };
    } catch (error) {
      console.error(`[auto-fix] Model ${modelName} failed:`, error.message);
      lastError = error;
      if (error.message.includes('API_KEY') || error.message.includes('401') || error.message.includes('403')) {
        throw new Error(`API key error: ${error.message}`);
      }
    }
  }

  throw new Error(`All models failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Export the main functions for use in the server routes
module.exports = { generateDocumentation, fixCode };
