/*
 * ============================================================
 *  DocuGenius AI — Client-Side Application Logic
 *  FILE: public/app.js
 *  PURPOSE: Handles all UI interactions, API calls to the
 *           backend, and rendering of generated documentation.
 * ============================================================
 */

// ── DOM Element References ──────────────────────────────────
const codeInput = document.getElementById("code-input");
const languageSelect = document.getElementById("language-select");
const exampleSelect = document.getElementById("example-select");
const formatToggle = document.getElementById("format-toggle");
const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const charCount = document.getElementById("char-count");
const lineNumbers = document.getElementById("line-numbers");

const outputControls = document.getElementById("output-controls");
const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const outputContent = document.getElementById("output-content");

const copyBtn = document.getElementById("copy-btn");
const copyRawBtn = document.getElementById("copy-raw-btn");
const downloadBtn = document.getElementById("download-btn");
const downloadFormatSelect = document.getElementById("download-format-select");

const docStyleSelect = document.getElementById("doc-style");

const toastContainer = document.getElementById("toast-container");

// Error banner elements
const errorBanner = document.getElementById("error-banner");
const errorMessageText = document.getElementById("error-message-text");
const autoFixBtn = document.getElementById("auto-fix-btn");
const autoFixLabel = document.getElementById("auto-fix-label");
const errorDismissBtn = document.getElementById("error-dismiss-btn");

// ── Application State ───────────────────────────────────────
let currentFormat = "markdown";
let rawDocumentation = ""; // Stores raw output for copy/download
let validationTimer = null; // Debounce handle for code validation

// ── Example Code Presets ────────────────────────────────────
const exampleCode = {
  python: `class Calculator:
    """A simple calculator class."""
    
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result
    
    def subtract(self, a, b):
        result = a - b
        self.history.append(f"{a} - {b} = {result}")
        return result
    
    def multiply(self, a, b):
        result = a * b
        self.history.append(f"{a} * {b} = {result}")
        return result
    
    def divide(self, a, b):
        if b == 0:
            raise ValueError("Cannot divide by zero")
        result = a / b
        self.history.append(f"{a} / {b} = {result}")
        return result
    
    def get_history(self):
        return self.history.copy()
    
    def clear_history(self):
        self.history = []

def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    return sequence`,

  javascript: `/**
 * TaskManager - A task management utility
 */
class TaskManager {
  constructor(owner) {
    this.owner = owner;
    this.tasks = [];
    this.nextId = 1;
  }

  addTask(title, priority = 'medium', dueDate = null) {
    const task = {
      id: this.nextId++,
      title,
      priority,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    };
    this.tasks.push(task);
    return task;
  }

  completeTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) throw new Error(\`Task with id \${id} not found\`);
    task.completed = true;
    task.completedAt = new Date().toISOString();
    return task;
  }

  getTasksByPriority(priority) {
    return this.tasks.filter(t => t.priority === priority && !t.completed);
  }

  getOverdueTasks() {
    const now = new Date();
    return this.tasks.filter(t => {
      return !t.completed && t.dueDate && new Date(t.dueDate) < now;
    });
  }

  getSummary() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending, owner: this.owner };
  }

  deleteTasks(id) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error(\`Task with id \${id} not found\`);
    return this.tasks.splice(index, 1)[0];
  }
}

async function fetchUserData(userId) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    if (!response.ok) throw new Error(\`HTTP error: \${response.status}\`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}`,

  java: `import java.util.*;
import java.util.stream.Collectors;

public class StudentManager {
    private List<Student> students;
    private String department;

    public StudentManager(String department) {
        this.department = department;
        this.students = new ArrayList<>();
    }

    public void addStudent(String name, int age, double gpa) {
        Student student = new Student(
            generateId(), name, age, gpa, department
        );
        students.add(student);
    }

    public Student findById(String id) {
        return students.stream()
            .filter(s -> s.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new NoSuchElementException(
                "Student not found: " + id
            ));
    }

    public List<Student> getTopStudents(int limit) {
        return students.stream()
            .sorted(Comparator.comparingDouble(Student::getGpa).reversed())
            .limit(limit)
            .collect(Collectors.toList());
    }

    public double getAverageGpa() {
        return students.stream()
            .mapToDouble(Student::getGpa)
            .average()
            .orElse(0.0);
    }

    public Map<String, Long> getAgeDistribution() {
        return students.stream()
            .collect(Collectors.groupingBy(
                s -> {
                    if (s.getAge() < 20) return "Under 20";
                    else if (s.getAge() < 25) return "20-24";
                    else return "25+";
                },
                Collectors.counting()
            ));
    }

    private String generateId() {
        return department.substring(0, 3).toUpperCase()
            + "-" + String.format("%04d", students.size() + 1);
    }

    public int getStudentCount() {
        return students.size();
    }

    public String getDepartment() {
        return department;
    }
}`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Login Form</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <main class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h2>Welcome Back</h2>
                <p>Please enter your details to sign in.</p>
            </div>
            
            <form id="login-form" action="/api/login" method="POST">
                <div class="input-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required placeholder="you@example.com" autocomplete="email">
                </div>
                
                <div class="input-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required placeholder="••••••••" minlength="8">
                </div>
                
                <div class="form-actions">
                    <div class="remember-me">
                        <input type="checkbox" id="remember" name="remember">
                        <label for="remember">Remember me</label>
                    </div>
                    <a href="/forgot-password" class="forgot-link">Forgot password?</a>
                </div>
                
                <button type="submit" class="btn-primary">Sign In</button>
            </form>
            
            <div class="login-footer">
                <p>Don't have an account? <a href="/signup">Sign up</a></p>
            </div>
        </div>
    </main>
</body>
</html>`,

  css: `:root {
    --primary-color: #4f46e5;
    --primary-hover: #4338ca;
    --bg-color: #f3f4f6;
    --card-bg: #ffffff;
    --text-main: #111827;
    --text-muted: #6b7280;
    --border-color: #e5e7eb;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--bg-color);
    color: var(--text-main);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}

.login-card {
    background: var(--card-bg);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    width: 100%;
    max-width: 400px;
}

.input-group {
    margin-bottom: 1.5rem;
}

.input-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.input-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.input-group input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.btn-primary {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-primary:hover {
    background-color: var(--primary-hover);
}`,
};

// ── Event Listeners ─────────────────────────────────────────

/**
 * Character counter, line numbers, and validation — all on input.
 */
codeInput.addEventListener("input", () => {
  const len = codeInput.value.length;
  charCount.textContent = `${len.toLocaleString()} character${len !== 1 ? "s" : ""}`;
  updateLineNumbers();

  // Debounced validation (800ms after typing stops)
  clearTimeout(validationTimer);
  if (len > 0) {
    validationTimer = setTimeout(() => {
      const result = validateCodeSyntax(codeInput.value);
      if (!result.valid) {
        showErrorBanner(result.message);
      } else {
        hideErrorBanner();
      }
    }, 800);
  } else {
    hideErrorBanner();
  }
});

// Sync line number gutter scroll with textarea scroll
codeInput.addEventListener("scroll", () => {
  lineNumbers.scrollTop = codeInput.scrollTop;
});

/**
 * Clear button — resets the code editor.
 */
clearBtn.addEventListener("click", () => {
  codeInput.value = "";
  charCount.textContent = "0 characters";
  exampleSelect.value = "";
  hideErrorBanner();
  updateLineNumbers();
  codeInput.focus();
  showToast("Code cleared", "info");
});

/**
 * Example preset selector — loads sample code into the editor.
 */
exampleSelect.addEventListener("change", () => {
  const selected = exampleSelect.value;
  if (selected && exampleCode[selected]) {
    codeInput.value = exampleCode[selected];
    languageSelect.value = selected;
    charCount.textContent = `${codeInput.value.length.toLocaleString()} characters`;
    updateLineNumbers();
    hideErrorBanner();
    showToast(`Loaded ${selected.charAt(0).toUpperCase() + selected.slice(1)} example`, "info");
  }
});

/**
 * Format toggle buttons — switches between inline/markdown/readme.
 */
formatToggle.addEventListener("click", (e) => {
  const btn = e.target.closest(".format-btn");
  if (!btn) return;

  // Update active state
  formatToggle.querySelectorAll(".format-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  currentFormat = btn.dataset.format;
});

/**
 * Generate button — main action to generate documentation.
 */
generateBtn.addEventListener("click", generateDocs);

/**
 * Keyboard shortcut: Ctrl+Enter to generate.
 */
codeInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    generateDocs();
  }
});

/**
 * Copy rendered text button.
 */
copyBtn.addEventListener("click", () => {
  copyToClipboard(outputContent.innerText, "Documentation copied!");
});

/**
 * Copy raw markdown button.
 */
copyRawBtn.addEventListener("click", () => {
  copyToClipboard(rawDocumentation, "Raw markdown copied!");
});

/**
 * Download button — saves documentation as a .md file.
 */
downloadBtn.addEventListener("click", downloadDocs);

/**
 * Dismiss error banner button.
 */
errorDismissBtn.addEventListener("click", () => {
  hideErrorBanner();
});

/**
 * Auto Fix button — sends code to AI for syntax correction.
 */
autoFixBtn.addEventListener("click", async () => {
  const code = codeInput.value.trim();
  if (!code) return;

  // Show loading state on the button itself
  autoFixBtn.disabled = true;
  autoFixLabel.textContent = "Fixing...";

  try {
    const payload = { code, language: languageSelect.value || "" };

    const response = await fetch("/api/auto-fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Auto-fix failed");
    }

    // Replace editor content with fixed code
    codeInput.value = data.fixedCode;
    // Dispatch input event to update char counter + line numbers
    codeInput.dispatchEvent(new Event("input"));
    hideErrorBanner();
    showToast("Code fixed successfully!", "success");
  } catch (error) {
    console.error("Auto-fix error:", error);
    showToast(error.message, "error");
    // Shake the banner to draw attention
    errorBanner.classList.remove("shake");
    void errorBanner.offsetWidth; // reflow to restart animation
    errorBanner.classList.add("shake");
  } finally {
    autoFixBtn.disabled = false;
    autoFixLabel.textContent = "Auto Fix";
  }
});

// ── Core Functions ──────────────────────────────────────────

/**
 * Sends the code to the backend API and displays the generated documentation.
 * Handles loading states, error handling, and output rendering.
 */
async function generateDocs() {
  const code = codeInput.value.trim();

  // Validate input
  if (!code) {
    showToast("Please paste your code first!", "error");
    codeInput.focus();
    return;
  }

  if (code.length < 10) {
    showToast("Code is too short. Please provide a meaningful snippet.", "error");
    return;
  }

  // Final validation check to prevent generating bad code
  const validationResult = validateCodeSyntax(code);
  if (!validationResult.valid) {
    showErrorBanner(validationResult.message);
    // Shake the banner for attention
    errorBanner.classList.remove("shake");
    void errorBanner.offsetWidth; // trigger reflow
    errorBanner.classList.add("shake");
    showToast("Please fix the code errors or use Auto Fix before generating docs.", "error");
    return;
  }

  // Show loading state
  setUIState("loading");
  generateBtn.disabled = true;

  try {
    // Build request payload
    const payload = {
      code: code,
      language: languageSelect.value || "",
      format: currentFormat,
      docStyle: docStyleSelect.value || "standard",
    };

    // Send request to backend
    const response = await fetch("/api/generate-docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to generate documentation");
    }

    // Store raw output for copy/download
    rawDocumentation = data.documentation;

    // Render the output
    renderOutput(data.documentation, currentFormat);
    setUIState("output");
    showToast("Documentation generated successfully!", "success");
  } catch (error) {
    console.error("Generation error:", error);
    setUIState("empty");

    // Show user-friendly error message
    showToast(error.message, "error");
  } finally {
    generateBtn.disabled = false;
  }
}

/**
 * Renders the AI-generated documentation into the output panel.
 * - For "markdown" and "readme" formats: renders Markdown to HTML
 * - For "inline" format: displays as syntax-highlighted code
 * - For "visualize" format: renders a Mermaid.js flowchart
 *
 * @param {string} content - Raw documentation text
 * @param {string} format - The format used ("inline", "markdown", "readme", "visualize")
 */
function renderOutput(content, format) {
  if (format === "inline") {
    // For inline docs, strip markdown code fences if present and display as code
    let cleanCode = content;

    // Remove wrapping code fences (```language ... ```)
    const fenceMatch = cleanCode.match(/^```[\w]*\n([\s\S]*?)```\s*$/);
    if (fenceMatch) {
      cleanCode = fenceMatch[1];
    }

    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.textContent = cleanCode;
    pre.appendChild(code);
    outputContent.innerHTML = "";
    outputContent.appendChild(pre);

    // Apply syntax highlighting
    hljs.highlightElement(code);
  } else if (format === "visualize") {
    // Render Mermaid.js flowchart
    renderVisualization(content);
  } else {
    // For markdown/readme, render Markdown to HTML
    // Configure marked.js for safe rendering
    marked.setOptions({
      highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true,
    });

    outputContent.innerHTML = marked.parse(content);

    // Apply highlighting to any code blocks that weren't caught by marked
    outputContent.querySelectorAll("pre code:not(.hljs)").forEach((block) => {
      hljs.highlightElement(block);
    });
  }
}

/**
 * Renders a Mermaid.js flowchart from the AI-generated diagram syntax.
 * @param {string} content - Raw diagram text from AI
 */
async function renderVisualization(content) {
  let diagramCode = content.trim();

  // Strip any accidental markdown fences the AI may have added
  const fenceMatch = diagramCode.match(/```(?:mermaid)?\n?([\s\S]*?)```/);
  if (fenceMatch) {
    diagramCode = fenceMatch[1].trim();
  }

  // Ensure it starts with a valid Mermaid directive
  if (!diagramCode.startsWith("flowchart") && !diagramCode.startsWith("graph")) {
    diagramCode = "flowchart TD\n" + diagramCode;
  }

  // Store raw diagram code for copy/download
  rawDocumentation = diagramCode;

  // Build container DOM
  outputContent.innerHTML = "";

  const vizContainer = document.createElement("div");
  vizContainer.className = "viz-container";

  const vizHeader = document.createElement("div");
  vizHeader.className = "viz-header";
  vizHeader.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
    <span>Code Flow Visualization</span>
  `;

  const diagramWrapper = document.createElement("div");
  diagramWrapper.className = "viz-diagram";

  vizContainer.appendChild(vizHeader);
  vizContainer.appendChild(diagramWrapper);
  outputContent.appendChild(vizContainer);

  try {
    const uniqueId = "mermaid-" + Date.now();
    const { svg } = await mermaid.render(uniqueId, diagramCode);
    diagramWrapper.innerHTML = svg;

    // Make SVG responsive
    const svgEl = diagramWrapper.querySelector("svg");
    if (svgEl) {
      svgEl.removeAttribute("width");
      svgEl.removeAttribute("height");
      svgEl.style.width = "100%";
      svgEl.style.height = "auto";
      svgEl.style.maxWidth = "100%";
    }
  } catch (err) {
    console.error("Mermaid render error:", err);
    diagramWrapper.innerHTML = `
      <div class="viz-error">
        <p>Could not render the diagram. The AI may have generated invalid Mermaid syntax.</p>
        <pre class="viz-raw-code">${diagramCode.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
      </div>`;
  }
}

/**
 * Controls the visibility of UI states: empty, loading, or output.
 * @param {"empty"|"loading"|"output"} state
 */
function setUIState(state) {
  emptyState.style.display = state === "empty" ? "flex" : "none";
  loadingState.style.display = state === "loading" ? "flex" : "none";
  outputContent.style.display = state === "output" ? "block" : "none";
  outputControls.style.display = state === "output" ? "flex" : "none";
}

/**
 * Copies text to the clipboard using the Clipboard API.
 * @param {string} text - Text to copy
 * @param {string} message - Success toast message
 */
async function copyToClipboard(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message, "success");
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast(message, "success");
  }
}

/**
 * Downloads the generated documentation as a file.
 * visualize → .svg  |  inline → .txt  |  markdown/readme → depends on select
 */
function downloadDocs() {
  if (!rawDocumentation || outputContent.style.display === "none") {
    showToast("No documentation to download", "error");
    return;
  }

  // SVG export for visualize format
  if (currentFormat === "visualize") {
    const svgEl = outputContent.querySelector(".viz-diagram svg");
    if (!svgEl) {
      showToast("No diagram to download", "error");
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgEl);
    triggerDownload(svgData, "DocuGenius_Flowchart.svg", "image/svg+xml;charset=utf-8");
    showToast("Diagram downloaded as SVG!", "success");
    return;
  }

  // Inline format → download as .txt code file
  if (currentFormat === "inline") {
    triggerDownload(rawDocumentation, "DocuGenius_Commented_Code.txt", "text/plain;charset=utf-8");
    showToast("Downloaded as .txt!", "success");
    return;
  }

  // Get selected format
  const format = downloadFormatSelect.value;
  const baseFilename = currentFormat === "readme" ? "README" : "DocuGenius_Documentation";

  if (format === "pdf") {
    showToast("Generating PDF...", "info");
    const opt = {
      margin:       10,
      filename:     `${baseFilename}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(outputContent).save().then(() => {
        showToast("Downloaded as PDF!", "success");
    }).catch(err => {
        console.error(err);
        showToast("Error generating PDF", "error");
    });
    return;
  }

  if (format === "doc") {
    showToast("Generating Word Document...", "info");
    
    // Add inline styles for Word compatibility to maintain dark mode or generic formatting
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title><style>body { font-family: 'Inter', sans-serif; }</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + outputContent.innerHTML + footer;
    
    const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFilename}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast("Downloaded as DOC!", "success");
    return;
  }

  // Markdown (default)
  const filename = `${baseFilename}.md`;
  triggerDownload(rawDocumentation, filename, "text/markdown;charset=utf-8");
  showToast("Downloaded as " + filename + "!", "success");
}

/**
 * Creates a temporary anchor and triggers a file download.
 * @param {string} content - File content
 * @param {string} filename - Desired file name
 * @param {string} mimeType - MIME type string
 */
function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Displays a toast notification with an auto-dismiss timer.
 * @param {string} message - The message to display
 * @param {"success"|"error"|"info"} type - Toast type for styling
 */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  // Icons for each toast type
  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  toastContainer.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ── Code Syntax Validation Engine ──────────────────────────

/**
 * Validates code for common syntax issues.
 * Checks: unbalanced brackets, unclosed strings, not-code heuristic.
 * @param {string} code - The raw code string to validate
 * @returns {{ valid: boolean, message: string }}
 */
function validateCodeSyntax(code) {
  if (code.trim().length < 10) return { valid: true, message: "" };

  let curly = 0, square = 0, paren = 0;
  let inString = false, stringChar = "";
  let inLineComment = false, inBlockComment = false;
  let i = 0;

  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    // Handle end of line — clears line comment
    if (ch === "\n") {
      inLineComment = false;
      i++;
      continue;
    }

    // Skip if inside a line comment
    if (inLineComment) { i++; continue; }

    // Handle block comment end
    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    // Handle string content
    if (inString) {
      if (ch === "\\" ) { i += 2; continue; } // skip escaped character
      if (ch === stringChar) { inString = false; stringChar = ""; }
      i++;
      continue;
    }

    // Detect start of comments
    if (ch === "/" && next === "/") { inLineComment = true; i += 2; continue; }
    if (ch === "/" && next === "*") { inBlockComment = true; i += 2; continue; }

    // Detect start of strings
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = true;
      stringChar = ch;
      i++;
      continue;
    }

    // Count brackets
    if (ch === "{") curly++;
    else if (ch === "}") curly--;
    else if (ch === "[") square++;
    else if (ch === "]") square--;
    else if (ch === "(") paren++;
    else if (ch === ")") paren--;

    i++;
  }

  // Unclosed string literal
  if (inString) {
    return { valid: false, message: `Unclosed ${stringChar === '"' ? 'double-quote' : stringChar === "'" ? 'single-quote' : 'backtick'} string literal detected` };
  }

  // Unbalanced brackets
  if (curly !== 0) {
    return { valid: false, message: curly > 0 ? `Missing ${curly} closing brace${curly > 1 ? 's' : ''} }` : `${Math.abs(curly)} unexpected closing brace${Math.abs(curly) > 1 ? 's' : ''} }` };
  }
  if (square !== 0) {
    return { valid: false, message: square > 0 ? `Missing ${square} closing bracket${square > 1 ? 's' : ''} ]` : `${Math.abs(square)} unexpected closing bracket${Math.abs(square) > 1 ? 's' : ''} ]` };
  }
  if (paren !== 0) {
    return { valid: false, message: paren > 0 ? `Missing ${paren} closing parenthes${paren > 1 ? 'es' : 'is'} )` : `${Math.abs(paren)} unexpected closing parenthes${Math.abs(paren) > 1 ? 'es' : 'is'} )` };
  }

  // Not-code heuristic
  const codePattern = /\b(function|class|def|var|let|const|int|float|string|bool|return|if|else|for|while|import|from|public|private|void|print|echo|fn|struct|interface|type|async|await)\b|[{}\[\]();=><+\-*\/!&|]/;
  if (!codePattern.test(code)) {
    return { valid: false, message: "This doesn't look like code — no recognizable keywords or operators found" };
  }

  return { valid: true, message: "" };
}

/**
 * Shows the error detection banner with the given message.
 * @param {string} message - Error description
 */
function showErrorBanner(message) {
  errorMessageText.textContent = message;
  errorBanner.style.display = "block";
}

/**
 * Hides the error detection banner.
 */
function hideErrorBanner() {
  errorBanner.style.display = "none";
  errorBanner.classList.remove("shake");
}

/**
 * Updates the line number gutter to match the current textarea content.
 */
function updateLineNumbers() {
  const lines = (codeInput.value || "").split("\n");
  const count = lines.length;
  lineNumbers.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    const span = document.createElement("span");
    span.textContent = i;
    lineNumbers.appendChild(span);
  }
}

// ── Initialize ──────────────────────────────────────────────
// Set the initial UI state
setUIState("empty");

// Set initial line numbers
updateLineNumbers();

// Log a startup message
console.log(
  "%c🚀 DocuGenius AI — Ready!",
  "color: #6366f1; font-size: 14px; font-weight: bold;"
);
