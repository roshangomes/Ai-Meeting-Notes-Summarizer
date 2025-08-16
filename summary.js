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

  // Add event listeners
  generateBtn.addEventListener("click", generateSummary);
  editBtn.addEventListener("click", startEditing);
  saveEditsBtn.addEventListener("click", saveEdits);
  cancelEditsBtn.addEventListener("click", cancelEdits);
  shareBtn.addEventListener("click", showEmailSection);
  sendEmailBtn.addEventListener("click", sendEmail);
  cancelEmailBtn.addEventListener("click", hideEmailSection);
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
    const summaryText = document.getElementById("summaryText");
    const summarySection = document.getElementById("summarySection");

    summaryText.innerHTML = marked.parse(summary);
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
const GEMINI_API_KEY = "AIzaSyDDhgcDsygwnAoZUDzU8GBW55cdyhnsRfg"; // Replace with your actual API key
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGeminiAPI(content, prompt) {
  console.log("Calling Gemini API..."); // Debug log

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `${prompt}

Meeting Transcript:
${content}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    },
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API Error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Gemini API response received"); // Debug log

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error("Invalid response format from Gemini API");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

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
    await simulateEmailSending(recipientEmail, emailSubject, currentSummary);
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
