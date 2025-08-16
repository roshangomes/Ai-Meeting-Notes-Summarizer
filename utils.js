// function showLoading() {
//   document.getElementById("loading").style.display = "block";
//   document.getElementById("generateBtn").disabled = true;
// }

// function hideLoading() {
//   document.getElementById("loading").style.display = "none";
//   document.getElementById("generateBtn").disabled = false;
// }

// function showError(message) {
//   document.getElementById("error").textContent = message;
//   document.getElementById("error").style.display = "block";
// }

// function hideError() {
//   document.getElementById("error").style.display = "none";
// }

// function showEmailSuccess(message) {
//   document.getElementById("emailSuccess").textContent = message;
//   document.getElementById("emailSuccess").style.display = "block";
//   document.getElementById("emailError").style.display = "none";
// }

// function showEmailError(message) {
//   document.getElementById("emailError").textContent = message;
//   document.getElementById("emailError").style.display = "block";
//   document.getElementById("emailSuccess").style.display = "none";
// }

// function hideEmailMessages() {
//   document.getElementById("emailSuccess").style.display = "none";
//   document.getElementById("emailError").style.display = "none";
// }
// // Add these new functions to your existing utils.js

// function showSuccess(message) {
//   const successEl = document.getElementById("success");
//   if (successEl) {
//     successEl.textContent = message;
//     successEl.style.display = "block";
//     setTimeout(() => {
//       successEl.style.display = "none";
//     }, 5000);
//   }
// }

// function copyToClipboard(text) {
//   navigator.clipboard
//     .writeText(text)
//     .then(() => {
//       showSuccess("Summary copied to clipboard!");
//     })
//     .catch(() => {
//       showError("Failed to copy to clipboard");
//     });
// }

// function downloadSummary(content, filename) {
//   const blob = new Blob([content], { type: "text/plain" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename || "meeting-summary.txt";
//   a.click();
//   URL.revokeObjectURL(url);
// }

// // Enhanced email validation
// function isValidEmail(email) {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email) && email.length <= 254;
// }
function showLoading() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("generateBtn").disabled = true;
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("generateBtn").disabled = false;
}

function showError(message) {
  document.getElementById("error").textContent = message;
  document.getElementById("error").style.display = "block";
}

function hideError() {
  document.getElementById("error").style.display = "none";
}

function showEmailSuccess(message) {
  document.getElementById("emailSuccess").textContent = message;
  document.getElementById("emailSuccess").style.display = "block";
  document.getElementById("emailError").style.display = "none";
}

function showEmailError(message) {
  document.getElementById("emailError").textContent = message;
  document.getElementById("emailError").style.display = "block";
  document.getElementById("emailSuccess").style.display = "none";
}

function hideEmailMessages() {
  document.getElementById("emailSuccess").style.display = "none";
  document.getElementById("emailError").style.display = "none";
}

// ADD THESE NEW FUNCTIONS:
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Summary copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy to clipboard");
      });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Summary copied to clipboard!");
  }
}

function downloadSummary(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "meeting-summary.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
