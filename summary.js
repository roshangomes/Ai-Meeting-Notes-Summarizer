// Global variables
let currentSummary = "";
let isEditing = false;

// Wait for DOM to be fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const generateBtn = document.getElementById("generateBtn");
  const editBtn = document.getElementById("editBtn");
  const shareBtn = document.getElementById("shareBtn");
  const saveEditsBtn = document.getElementById("saveEditsBtn");
  const cancelEditsBtn = document.getElementById("cancelEditsBtn");
  const sendEmailBtn = document.getElementById("sendEmailBtn");
  const cancelEmailBtn = document.getElementById("cancelEmailBtn");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  // Add event listeners
  generateBtn.addEventListener("click", generateSummary);
  editBtn.addEventListener("click", startEditing);
  saveEditsBtn.addEventListener("click", saveEdits);
  cancelEditsBtn.addEventListener("click", cancelEdits);
  shareBtn.addEventListener("click", showEmailSection);
  sendEmailBtn.addEventListener("click", sendEmail);
  cancelEmailBtn.addEventListener("click", hideEmailSection);
  copyBtn.addEventListener("click", () => {
    console.log("Copy button clicked, currentSummary:", currentSummary);
    copyToClipboard(currentSummary);
  });
  downloadBtn.addEventListener("click", () =>
    downloadSummary(
      currentSummary,
      `meeting-summary-${new Date().toISOString().split("T")[0]}.txt`
    )
  );
});

async function generateSummary() {
  console.log("Generate Summary clicked"); // Debug log

  // Get the current uploaded file
  const uploadedFile = window.uploadedFile;
  console.log("Uploaded file:", uploadedFile); // Debug log

  if (!uploadedFile) {
    showError("Please upload a file first");
    return;
  }

  const customPrompt = document.getElementById("customPrompt").value.trim();
  console.log("Custom prompt:", customPrompt); // Debug log

  if (!customPrompt) {
    showError("Please enter custom instructions");
    return;
  }

  showLoading();
  hideError();

  try {
    console.log("Starting file read..."); // Debug log
    const fileContent = await window.readFileContent(uploadedFile);
    console.log("File content length:", fileContent.length); // Debug log

    console.log("Starting AI generation..."); // Debug log
    let summary;

    // Try Gemini API first, fall back to simulation if it fails
    try {
      summary = await callGeminiAPI(fileContent, customPrompt);
      console.log("Gemini API summary generated successfully"); // Debug log
    } catch (apiError) {
      console.warn("Gemini API failed, using fallback:", apiError.message);
      summary = await simulateAIGeneration(fileContent, customPrompt);
    }

    currentSummary = summary;
    const parsedSummary = marked.parse(summary);
    const summaryText = document.getElementById("summaryText");
    const summarySection = document.getElementById("summarySection");

    summaryText.innerHTML = parsedSummary;
    summarySection.style.display = "block";
    hideLoading();
    console.log("Summary generated and displayed successfully"); // Debug log
  } catch (err) {
    console.error("Error in generateSummary:", err); // Debug log
    hideLoading();
    showError("Error generating summary: " + err.message);
  }
}

// Add this at the top of your file after the global variables
const GEMINI_API_KEY = window.GEMINI_API_KEY; // Fallback for local testing
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGeminiAPI(content, prompt) {
  console.log("Calling Gemini API via serverless function..."); // Debug log

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Serverless API Error: ${
          errorData.error || response.statusText
        } (Status: ${response.status})`
      );
    }

    const data = await response.json();
    console.log("Serverless API response received"); // Debug log
    return data;
  } catch (error) {
    console.error("Serverless API Error:", error);
    throw error;
  }
}

// async function callGeminiAPI(content, prompt) {
//   console.log("Calling Gemini API directly..."); // Debug log

//   const requestBody = {
//     contents: [
//       {
//         parts: [
//           {
//             text: `${prompt}\n\nMeeting Transcript:\n${content}`,
//           },
//         ],
//       },
//     ],
//     generationConfig: {
//       temperature: 0.7,
//       topK: 1,
//       topP: 1,
//       maxOutputTokens: 2048,
//     },
//   };

//   try {
//     const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(
//         `Gemini API Error: ${
//           errorData.error?.message || response.statusText
//         } (Status: ${response.status})`
//       );
//     }

//     const data = await response.json();
//     console.log("Gemini API response received"); // Debug log

//     if (
//       !data.candidates ||
//       !data.candidates[0] ||
//       !data.candidates[0].content
//     ) {
//       throw new Error("Invalid response format from Gemini API");
//     }

//     return data.candidates[0].content.parts[0].text;
//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     throw error;
//   }
// }

// Fallback simulation function (in case API fails)
async function simulateAIGeneration(content, prompt) {
  console.log("Using fallback simulation..."); // Debug log
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const isActionFocused = prompt.toLowerCase().includes("action");
  const isExecutiveSummary = prompt.toLowerCase().includes("executive");

  return `MEETING SUMMARY (Simulated - API Failed)
Generated based on: "${prompt}"
File: ${window.uploadedFile.name}
Processed: ${new Date().toLocaleString()}

${isExecutiveSummary ? "EXECUTIVE SUMMARY:" : "KEY DISCUSSION POINTS:"}
• Project timeline and resource allocation reviewed
• Budget considerations for upcoming quarter
• Technical architecture decisions finalized
• Team capacity and skill requirements assessed

DECISIONS MADE:
• Approved technology stack selection
• Established review cycles and processes
• Budget allocation approved
• Team expansion authorized

${isActionFocused ? "PRIORITY ACTION ITEMS:" : "ACTION ITEMS:"}
• Update project timeline by end of week
• Prepare detailed budget breakdown
• Begin system documentation
• Start recruitment process
• Prepare launch strategy

NEXT STEPS:
• Schedule follow-up meeting
• Distribute documentation to stakeholders
• Begin planning phase
• Set up monitoring systems

---
Content processed: ${Math.min(content.length, 1000)} characters
Note: This is a simulated response due to API connectivity issues.`;
}

// Edit functionality
function startEditing() {
  isEditing = true;
  const editableSummary = document.getElementById("editableSummary");
  const summaryText = document.getElementById("summaryText");
  const editBtn = document.getElementById("editBtn");
  const saveEditsBtn = document.getElementById("saveEditsBtn");
  const cancelEditsBtn = document.getElementById("cancelEditsBtn");

  editableSummary.value = currentSummary;
  editableSummary.style.display = "block";
  summaryText.style.display = "none";
  editBtn.style.display = "none";
  saveEditsBtn.style.display = "inline-block";
  cancelEditsBtn.style.display = "inline-block";
}

function saveEdits() {
  const editableSummary = document.getElementById("editableSummary");
  const summaryText = document.getElementById("summaryText");

  currentSummary = editableSummary.value;
  summaryText.innerHTML = marked.parse(currentSummary);
  endEditing();
}

function cancelEdits() {
  endEditing();
}

function endEditing() {
  isEditing = false;
  const editableSummary = document.getElementById("editableSummary");
  const summaryText = document.getElementById("summaryText");
  const editBtn = document.getElementById("editBtn");
  const saveEditsBtn = document.getElementById("saveEditsBtn");
  const cancelEditsBtn = document.getElementById("cancelEditsBtn");

  editableSummary.style.display = "none";
  summaryText.style.display = "block";
  editBtn.style.display = "inline-block";
  saveEditsBtn.style.display = "none";
  cancelEditsBtn.style.display = "none";
}

// Email functionality
function showEmailSection() {
  const emailSection = document.getElementById("emailSection");
  emailSection.style.display = "block";
  hideEmailMessages();
}

function hideEmailSection() {
  const emailSection = document.getElementById("emailSection");
  emailSection.style.display = "none";
}

async function sendEmail() {
  const recipientEmail = document.getElementById("recipientEmail").value.trim();
  const emailSubject =
    document.getElementById("emailSubject").value.trim() || "Meeting Summary";
  if (!recipientEmail || !isValidEmail(recipientEmail)) {
    showEmailError("Please enter a valid email address");
    return;
  }
  try {
    // Convert Markdown to formatted plain text with structured sections and bullets
    const plainTextSummary = currentSummary
      .split("\n") // Split into lines
      .map((line) => {
        let cleanedLine = line
          .replace(/^\*\s+/gm, "") // Remove original bullet markers
          .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markers
          .replace(/^\s*#+\s*/gm, "") // Remove headers
          .replace(/_\*(.*?)\*_/g, "$1") // Remove italic markers
          .trim();

        // Check for section headers (ends with ":") and avoid bullets
        if (cleanedLine.endsWith(":")) {
          return cleanedLine;
        }
        // Add bullets to list items that were originally bulleted
        else if (line.match(/^\*\s+/)) {
          return "- " + cleanedLine;
        }
        return cleanedLine;
      })
      .join("\n") // Join with single line breaks
      .replace(/(:\n-)/g, ":\n\n-") // Add extra line break before bulleted lists after headers
      .replace(/(\w+:)\n(\w)/g, "$1\n\n$2") // Add double line breaks after section headers
      .trim(); // Clean up whitespace

    const response = await fetch("/api/sendEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipientEmail,
        subject: emailSubject,
        content: plainTextSummary,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send email");
    }

    const data = await response.json();
    showEmailSuccess("Summary sent successfully to " + recipientEmail);
    document.getElementById("recipientEmail").value = "";
    document.getElementById("emailSubject").value = "Meeting Summary";
  } catch (err) {
    showEmailError("Failed to send email: " + err.message);
  }
}

async function simulateEmailSending(email, subject, content) {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  console.log("Email would be sent to:", email);
  console.log("Subject:", subject);
  console.log("Content:", content);
  return true;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function copyToClipboard(text) {
  if (!navigator.clipboard) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showSuccess("Summary copied to clipboard!");
    } catch (err) {
      showError("Failed to copy: " + err.message);
    } finally {
      document.body.removeChild(textarea);
    }
  } else {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showSuccess("Summary copied to clipboard!");
      })
      .catch((err) => {
        showError("Failed to copy: " + err.message);
      });
  }
}

function downloadSummary(text, filename) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  showSuccess("Summary downloaded as " + filename);
}

function showSuccess(message) {
  const successDiv = document.getElementById("success");
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = "block";
    setTimeout(() => {
      successDiv.style.display = "none";
    }, 3000); // Hide after 3 seconds
  } else {
    console.warn("Success div not found!");
  }
}

function showError(message) {
  const errorDiv = document.getElementById("error");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 3000); // Hide after 3 seconds
  } else {
    console.warn("Error div not found!");
  }
}
